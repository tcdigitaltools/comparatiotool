package talentcapitalme.com.comparatio.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import talentcapitalme.com.comparatio.entity.CalculationResult;

import java.math.BigDecimal;
import java.util.List;

public interface CalculationResultRepository extends MongoRepository<CalculationResult, String> {
    List<CalculationResult> findByBatchId(String batchId);

    List<CalculationResult> findByClientIdAndBatchId(String clientId, String batchId);

    // Find bulk calculation results only (exclude individual calculations)
    List<CalculationResult> findByClientIdAndBatchIdAndBatchIdNotLike(String clientId, String batchId, String excludePattern);

    long countByClientId(String clientId);

    // Pageable queries for efficient database pagination
    Page<CalculationResult> findByClientId(String clientId, Pageable pageable);

    Page<CalculationResult> findByClientIdAndBatchId(String clientId, String batchId, Pageable pageable);
    
    // Duplicate prevention: Delete existing results by client and employee codes
    long deleteByClientIdAndEmployeeCodeIn(String clientId, List<String> employeeCodes);
    
    // Complete cleanup: Delete all calculation results for a client (for fresh bulk uploads)
    long deleteByClientId(String clientId);
    
    // Cleanup specific batch: Delete all results for a specific batch
    long deleteByClientIdAndBatchId(String clientId, String batchId);
    
    // Salary increase analysis - Percentage filters (using increasePct field)
    // Converting to decimal for precise decimal handling
    @Query("{ 'clientId': ?0, $expr: { $eq: [ { $round: [ { $toDecimal: '$increasePct' }, 2 ] }, { $toDecimal: ?1 } ] } }")
    Page<CalculationResult> findByClientIdAndIncreasePct(String clientId, BigDecimal percentageIncrease, Pageable pageable);
    
    @Query("{ 'clientId': ?0, $expr: { $lt: [ { $round: [ { $toDecimal: '$increasePct' }, 2 ] }, { $toDecimal: ?1 } ] } }")
    Page<CalculationResult> findByClientIdAndIncreasePctLessThan(String clientId, BigDecimal percentageIncrease, Pageable pageable);
    
    @Query("{ 'clientId': ?0, $expr: { $gt: [ { $round: [ { $toDecimal: '$increasePct' }, 2 ] }, { $toDecimal: ?1 } ] } }")
    Page<CalculationResult> findByClientIdAndIncreasePctGreaterThan(String clientId, BigDecimal percentageIncrease, Pageable pageable);
    
    // Salary increase analysis - Dollar amount filters (calculated as newSalary - currentSalary)
    // Using MongoDB aggregation expressions to filter by calculated field
    // Converting string fields to decimal for precise decimal handling
    @Query("{ 'clientId': ?0, $expr: { $eq: [ { $round: [ { $subtract: [{ $toDecimal: '$newSalary' }, { $toDecimal: '$currentSalary' }] }, 2 ] }, { $toDecimal: ?1 } ] } }")
    Page<CalculationResult> findByClientIdAndSalaryIncreaseEquals(String clientId, BigDecimal salaryIncrease, Pageable pageable);
    
    @Query("{ 'clientId': ?0, $expr: { $lt: [ { $round: [ { $subtract: [{ $toDecimal: '$newSalary' }, { $toDecimal: '$currentSalary' }] }, 2 ] }, { $toDecimal: ?1 } ] } }")
    Page<CalculationResult> findByClientIdAndSalaryIncreaseLessThan(String clientId, BigDecimal salaryIncrease, Pageable pageable);
    
    @Query("{ 'clientId': ?0, $expr: { $gt: [ { $round: [ { $subtract: [{ $toDecimal: '$newSalary' }, { $toDecimal: '$currentSalary' }] }, 2 ] }, { $toDecimal: ?1 } ] } }")
    Page<CalculationResult> findByClientIdAndSalaryIncreaseGreaterThan(String clientId, BigDecimal salaryIncrease, Pageable pageable);
    
    // Range filtering with equality (inclusive)
    @Query("{ 'clientId': ?0, $expr: { $and: [ " +
           "{ $gte: [ { $round: [ { $subtract: [{ $toDecimal: '$newSalary' }, { $toDecimal: '$currentSalary' }] }, 2 ] }, { $toDecimal: ?1 } ] }, " +
           "{ $lte: [ { $round: [ { $subtract: [{ $toDecimal: '$newSalary' }, { $toDecimal: '$currentSalary' }] }, 2 ] }, { $toDecimal: ?2 } ] } " +
           "] } }")
    Page<CalculationResult> findByClientIdAndSalaryIncreaseBetween(String clientId, BigDecimal from, BigDecimal to, Pageable pageable);
    
    // Range filtering with equality for percentage increase (inclusive)
    @Query("{ 'clientId': ?0, $expr: { $and: [ " +
           "{ $gte: [ { $round: [ { $toDecimal: '$increasePct' }, 2 ] }, { $toDecimal: ?1 } ] }, " +
           "{ $lte: [ { $round: [ { $toDecimal: '$increasePct' }, 2 ] }, { $toDecimal: ?2 } ] } " +
           "] } }")
    Page<CalculationResult> findByClientIdAndIncreasePctBetween(String clientId, BigDecimal from, BigDecimal to, Pageable pageable);
    
    // Greater than or equal to for salary increase
    @Query("{ 'clientId': ?0, $expr: { $gte: [ { $round: [ { $subtract: [{ $toDecimal: '$newSalary' }, { $toDecimal: '$currentSalary' }] }, 2 ] }, { $toDecimal: ?1 } ] } }")
    Page<CalculationResult> findByClientIdAndSalaryIncreaseGreaterThanOrEqual(String clientId, BigDecimal salaryIncrease, Pageable pageable);
    
    // Less than or equal to for salary increase
    @Query("{ 'clientId': ?0, $expr: { $lte: [ { $round: [ { $subtract: [{ $toDecimal: '$newSalary' }, { $toDecimal: '$currentSalary' }] }, 2 ] }, { $toDecimal: ?1 } ] } }")
    Page<CalculationResult> findByClientIdAndSalaryIncreaseLessThanOrEqual(String clientId, BigDecimal salaryIncrease, Pageable pageable);
    
    // Greater than or equal to for percentage increase
    @Query("{ 'clientId': ?0, $expr: { $gte: [ { $round: [ { $toDecimal: '$increasePct' }, 2 ] }, { $toDecimal: ?1 } ] } }")
    Page<CalculationResult> findByClientIdAndIncreasePctGreaterThanOrEqual(String clientId, BigDecimal percentageIncrease, Pageable pageable);
    
    // Less than or equal to for percentage increase
    @Query("{ 'clientId': ?0, $expr: { $lte: [ { $round: [ { $toDecimal: '$increasePct' }, 2 ] }, { $toDecimal: ?1 } ] } }")
    Page<CalculationResult> findByClientIdAndIncreasePctLessThanOrEqual(String clientId, BigDecimal percentageIncrease, Pageable pageable);
}