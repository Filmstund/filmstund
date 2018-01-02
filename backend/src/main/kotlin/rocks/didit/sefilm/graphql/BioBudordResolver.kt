package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.services.BudordService

@Component
class BioBudordResolver(private val budordService: BudordService) : GraphQLQueryResolver {
  fun allBiobudord() = budordService.getAll()
  fun randomBudord() = budordService.getRandom()
}


