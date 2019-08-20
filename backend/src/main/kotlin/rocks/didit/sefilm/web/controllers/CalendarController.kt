package rocks.didit.sefilm.web.controllers

import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import rocks.didit.sefilm.Application
import rocks.didit.sefilm.services.CalendarService
import java.util.*
import javax.servlet.http.HttpServletRequest

@RestController()
@RequestMapping(CalendarController.PATH)
class CalendarController(private val calendarService: CalendarService) {

    companion object {
        const val PATH = "${Application.API_BASE_PATH}/ical"
        const val FEED_PATH = "/{feedId}"
        private val log = LoggerFactory.getLogger(CalendarController::class.java)
    }

    @GetMapping(FEED_PATH, produces = ["text/calendar; charset=utf-8"])
    fun calendarFeedForUser(@PathVariable feedId: UUID, req: HttpServletRequest): String {
        log.debug("Calendar request from: ${req.remoteAddr}:${req.remotePort} for $feedId")
        return calendarService.getCalendarFeed(feedId).write()
    }
}