package talentcapitalme.com.comparatio.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import talentcapitalme.com.comparatio.dto.BulkResponse;
import talentcapitalme.com.comparatio.dto.BulkRowResult;
import talentcapitalme.com.comparatio.dto.CalcRequest;
import talentcapitalme.com.comparatio.dto.CalcResponse;
import talentcapitalme.com.comparatio.entity.CalculationResult;
import talentcapitalme.com.comparatio.repository.CalculationResultRepository;
import talentcapitalme.com.comparatio.security.Authz;
import talentcapitalme.com.comparatio.service.IExcelProcessingService;
import talentcapitalme.com.comparatio.service.ICompensationService;
import talentcapitalme.com.comparatio.service.PerformanceRatingService;
import talentcapitalme.com.comparatio.util.CalculationResultMapper;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

// Handles compensation calculations and Excel processing
@Slf4j
@RestController
@RequestMapping("/api/calc")
@RequiredArgsConstructor
@Tag(name = "Calculations", description = "Individual and bulk compensation calculations")
public class CalcController {
    private final ICompensationService service;
    private final IExcelProcessingService excelProcessingService;
    private final CalculationResultRepository resultRepo;
    private final CalculationResultMapper resultMapper;
    private final PerformanceRatingService performanceRatingService;

    @Operation(summary = "Individual Calculation", description = "Calculate compensation for a single employee")
    @PostMapping("/individual")
    public CalcResponse calc(@Valid @RequestBody CalcRequest req) {
        CalcResponse response = service.calculate(req);
        return response;
    }

    @Operation(summary = "Bulk Calculation", description = "Process Excel file and return enhanced Excel with calculation results")
    @PostMapping(value = "/bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> bulk(
            @Parameter(description = "Excel file with employee data") @RequestParam("file") MultipartFile file) {
        try {
            BulkResponse response = excelProcessingService.processExcelFile(file);
            byte[] xlsx = excelProcessingService.generateEnhancedExcel(response.getRows(), response.getBatchId());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(
                    MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename("bulk-calculation-results-" + response.getBatchId() + ".xlsx").build());

            return new ResponseEntity<>(xlsx, headers, HttpStatus.OK);

        } catch (IOException e) {
            String errorMessage = e.getMessage();
            if (errorMessage.contains("YearOfEra") || errorMessage.contains("date")) {
                errorMessage = "The Excel file contains unsupported date formats. Please convert all date columns to text format before uploading.";
            } else if (errorMessage.contains("Unsupported")) {
                errorMessage = "The Excel file contains unsupported formatting. Please save as a simple .xlsx format with only text and numbers.";
            }

            String errorJson = String.format(
                    "{\"error\": \"%s\", \"suggestion\": \"Please ensure your Excel file has these columns: Employee Code, Employee Name, Job Title, Years of Experience, Performance Rating, Current Salary, Mid of Scale\"}",
                    errorMessage.replace("\"", "\\\""));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            return new ResponseEntity<>(errorJson.getBytes(), headers, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            String errorJson = String.format("{\"error\": \"Unexpected error: %s\"}",
                    e.getMessage().replace("\"", "\\\""));
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            return new ResponseEntity<>(errorJson.getBytes(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "Upload Excel File", description = "Simple file upload endpoint for testing")
    @PostMapping("/upload")
    public ResponseEntity<String> uploadExcel(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file uploaded!");
        }
        return ResponseEntity.ok("File uploaded: " + file.getOriginalFilename());
    }

    @Operation(summary = "Get Calculation Results as Table Data", description = "Get paginated calculation results for a batch as JSON for table display")
    @GetMapping("/bulk/{batchId}/table")
    public ResponseEntity<BulkResponse> getResultsAsTable(
            @Parameter(description = "Batch ID from bulk calculation") @PathVariable String batchId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "50") int size) {
        String clientId = Authz.getCurrentUserClientId();

        List<CalculationResult> dbResults = resultRepo.findByBatchId(batchId).stream()
                .filter(r -> clientId.equals(r.getClientId()))
                .sorted((r1, r2) -> r1.getEmployeeCode().compareTo(r2.getEmployeeCode()))
                .toList();
        
        var allRows = new ArrayList<BulkRowResult>();
        for (int i = 0; i < dbResults.size(); i++) {
            CalculationResult r = dbResults.get(i);
            BulkRowResult rowResult = BulkRowResult.builder()
                    .rowIndex(i + 1)
                    .employeeCode(r.getEmployeeCode())
                    .employeeName(r.getEmployeeName() != null ? r.getEmployeeName() : "N/A")
                    .jobTitle(r.getJobTitle())
                    .yearsExperience(r.getYearsExperience())
                    .performanceRating5(convertBucketToRating(r.getPerfBucket()))
                    .currentSalary(r.getCurrentSalary())
                    .midOfScale(r.getMidOfScale())
                    .compaRatio(r.getCompaRatio())
                    .compaLabel(r.getCompaLabel())
                    .increasePct(r.getIncreasePct())
                    .newSalary(r.getNewSalary())
                    .increaseAmount(r.getNewSalary().subtract(r.getCurrentSalary()))
                    .build();
            allRows.add(rowResult);
        }

        int successCount = (int) allRows.stream().filter(r -> r.getError() == null).count();
        int errorCount = allRows.size() - successCount;

        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, allRows.size());
        var paginatedRows = allRows.subList(startIndex, endIndex);

        BulkResponse response = new BulkResponse(batchId, allRows.size(), successCount, errorCount, paginatedRows);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Download Results", description = "Download Excel file with calculation results for a batch")
    @GetMapping("/bulk/{batchId}")
    public ResponseEntity<byte[]> download(
            @Parameter(description = "Batch ID from bulk calculation") @PathVariable String batchId)
            throws IOException {
        String clientId = Authz.getCurrentUserClientId();
        
        List<CalculationResult> dbResults = resultRepo.findByBatchId(batchId).stream()
                .filter(r -> clientId.equals(r.getClientId()))
                .sorted((r1, r2) -> r1.getEmployeeCode().compareTo(r2.getEmployeeCode()))
                .toList();
        
        var rows = new ArrayList<BulkRowResult>();
        for (int i = 0; i < dbResults.size(); i++) {
            CalculationResult r = dbResults.get(i);
            BulkRowResult rowResult = BulkRowResult.builder()
                    .rowIndex(i + 1)
                    .employeeCode(r.getEmployeeCode())
                    .employeeName(r.getEmployeeName() != null ? r.getEmployeeName() : "N/A")
                    .jobTitle(r.getJobTitle())
                    .yearsExperience(r.getYearsExperience())
                    .performanceRating5(convertBucketToRating(r.getPerfBucket()))
                    .currentSalary(r.getCurrentSalary())
                    .midOfScale(r.getMidOfScale())
                    .compaRatio(r.getCompaRatio())
                    .compaLabel(r.getCompaLabel())
                    .increasePct(r.getIncreasePct())
                    .newSalary(r.getNewSalary())
                    .increaseAmount(r.getNewSalary().subtract(r.getCurrentSalary()))
                    .build();
            rows.add(rowResult);
        }

        byte[] xlsx = excelProcessingService.generateEnhancedExcel(rows, batchId);
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        h.setContentDisposition(ContentDisposition.attachment().filename("bulk-results-" + batchId + ".xlsx").build());
        return new ResponseEntity<>(xlsx, h, HttpStatus.OK);
    }

    @Operation(summary = "Get All Calculation Results (Pageable)", description = "Fetch all calculation results for current client with Spring Data pagination and sorting")
    @GetMapping("/results")
    public ResponseEntity<BulkResponse> getAllResults(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort by field (createdAt, employeeCode, newSalary, etc.)") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (ASC or DESC)") @RequestParam(defaultValue = "DESC") String sortDirection) {
        String clientId = Authz.getCurrentUserClientId();

        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<CalculationResult> resultPage = resultRepo.findByClientId(clientId, pageable);
        List<BulkRowResult> rows = resultMapper.convertToBulkRowResults(resultPage.getContent());

        BulkResponse response = BulkResponse.builder()
                .batchId("all")
                .totalRows((int) resultPage.getTotalElements())
                .successCount(rows.size())
                .errorCount(0)
                .rows(rows)
                .pageNumber(resultPage.getNumber())
                .pageSize(resultPage.getSize())
                .totalPages(resultPage.getTotalPages())
                .totalElements(resultPage.getTotalElements())
                .first(resultPage.isFirst())
                .last(resultPage.isLast())
                .build();

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get Calculation Results by Batch and Client (Pageable)", description = "Fetch calculation results for a specific batch and client with efficient pagination")
    @GetMapping("/results/batch/{batchId}")
    public ResponseEntity<BulkResponse> getResultsByBatch(
            @Parameter(description = "Batch ID") @PathVariable String batchId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (ASC or DESC)") @RequestParam(defaultValue = "DESC") String sortDirection) {
        String clientId = Authz.getCurrentUserClientId();

        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<CalculationResult> resultPage = resultRepo.findByClientIdAndBatchId(clientId, batchId, pageable);
        List<BulkRowResult> rows = resultMapper.convertToBulkRowResults(resultPage.getContent());

        BulkResponse response = BulkResponse.builder()
                .batchId(batchId)
                .totalRows((int) resultPage.getTotalElements())
                .successCount(rows.size())
                .errorCount(0)
                .rows(rows)
                .pageNumber(resultPage.getNumber())
                .pageSize(resultPage.getSize())
                .totalPages(resultPage.getTotalPages())
                .totalElements(resultPage.getTotalElements())
                .first(resultPage.isFirst())
                .last(resultPage.isLast())
                .build();

        return ResponseEntity.ok(response);
    }

    private int convertBucketToRating(int perfBucket) {
        var userScale = performanceRatingService.getUserPerformanceRatingScale();
        
        switch (userScale) {
            case THREE_POINT:
                return perfBucket;
            case FIVE_POINT:
                switch (perfBucket) {
                    case 1: return 1;
                    case 2: return 2;
                    case 3: return 4;
                    default: return 1;
                }
            default:
                return perfBucket == 3 ? 4 : perfBucket;
        }
    }

    private BulkRowResult convertToRowResult(CalculationResult r) {
        return BulkRowResult.builder()
                .rowIndex(0)
                .employeeCode(r.getEmployeeCode())
                .employeeName(r.getEmployeeName() != null ? r.getEmployeeName() : "N/A")
                .jobTitle(r.getJobTitle())
                .yearsExperience(r.getYearsExperience())
                .performanceRating5(convertBucketToRating(r.getPerfBucket()))
                .currentSalary(r.getCurrentSalary())
                .midOfScale(r.getMidOfScale())
                .compaRatio(r.getCompaRatio())
                .compaLabel(r.getCompaLabel())
                .increasePct(r.getIncreasePct())
                .newSalary(r.getNewSalary())
                .increaseAmount(r.getNewSalary().subtract(r.getCurrentSalary()))
                .build();
    }


    @Operation(summary = "Analyze by Salary Increase Amount", 
               description = "Filter employees by salary increase amount in dollars using range parameters. Both 'from' and 'to' are inclusive.")
    @GetMapping("/analysis/salary-increase")
    public ResponseEntity<Page<BulkRowResult>> analyzeBySalaryIncrease(
            @Parameter(description = "Salary increase amount from (inclusive)") 
            @RequestParam(required = false) java.math.BigDecimal from,
            
            @Parameter(description = "Salary increase amount to (inclusive)") 
            @RequestParam(required = false) java.math.BigDecimal to,
            
            @Parameter(description = "Page number") 
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(description = "Page size") 
            @RequestParam(defaultValue = "20") int size) {
        
        String clientId = Authz.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("newSalary").descending());
        Page<CalculationResult> results;
        
        if (from != null && to != null) {
            results = resultRepo.findByClientIdAndSalaryIncreaseBetween(clientId, from, to, pageable);
        } else if (from != null) {
            results = resultRepo.findByClientIdAndSalaryIncreaseGreaterThanOrEqual(clientId, from, pageable);
        } else if (to != null) {
            results = resultRepo.findByClientIdAndSalaryIncreaseLessThanOrEqual(clientId, to, pageable);
        } else {
            results = resultRepo.findByClientId(clientId, pageable);
        }
        
        Page<BulkRowResult> dtoPage = results.map(this::convertToRowResult);
        return ResponseEntity.ok(dtoPage);
    }

    @Operation(summary = "Analyze by Percentage Increase", 
               description = "Filter employees by percentage increase using range parameters. Both 'from' and 'to' are inclusive.")
    @GetMapping("/analysis/percentage-increase")
    public ResponseEntity<Page<BulkRowResult>> analyzeByPercentageIncrease(
            @Parameter(description = "Percentage increase from (inclusive)") 
            @RequestParam(required = false) java.math.BigDecimal from,
            
            @Parameter(description = "Percentage increase to (inclusive)") 
            @RequestParam(required = false) java.math.BigDecimal to,
            
            @Parameter(description = "Page number") 
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(description = "Page size") 
            @RequestParam(defaultValue = "20") int size) {
        
        String clientId = Authz.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("increasePct").descending());
        Page<CalculationResult> results;
        
        if (from != null && to != null) {
            results = resultRepo.findByClientIdAndIncreasePctBetween(clientId, from, to, pageable);
        } else if (from != null) {
            results = resultRepo.findByClientIdAndIncreasePctGreaterThanOrEqual(clientId, from, pageable);
        } else if (to != null) {
            results = resultRepo.findByClientIdAndIncreasePctLessThanOrEqual(clientId, to, pageable);
        } else {
            results = resultRepo.findByClientId(clientId, pageable);
        }
        
        Page<BulkRowResult> dtoPage = results.map(this::convertToRowResult);
        return ResponseEntity.ok(dtoPage);
    }
}
