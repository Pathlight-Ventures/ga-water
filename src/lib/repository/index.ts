// Repository layer exports - export classes only, no singletons
export { WaterSystemsRepository, type WaterSystem, type WaterSystemSearchResult, type WaterSystemStats, type SearchFilters } from './water-systems'
export { ViolationsRepository, type Violation, type ViolationStats, type ViolationFilters } from './violations'
export { AnalyticsRepository, type ComplianceTrend, type AnalyticsFilters } from './analytics'

// Export singleton getters (lazy initialization)
export { waterSystemsRepo } from './water-systems'
export { violationsRepo } from './violations'
export { analyticsRepo } from './analytics' 