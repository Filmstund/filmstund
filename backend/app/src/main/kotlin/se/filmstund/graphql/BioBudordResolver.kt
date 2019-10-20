@file:Suppress("unused")

package se.filmstund.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import org.springframework.stereotype.Component
import se.filmstund.services.BudordService

@Component
class BioBudordResolver(private val budordService: BudordService) : GraphQLQueryResolver {
  fun allBiobudord() = budordService.getAll()
  fun randomBudord() = budordService.getRandom()
}


