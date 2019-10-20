package se.filmstund

import org.springframework.security.test.context.support.WithSecurityContext

@Retention(AnnotationRetention.RUNTIME)
@WithSecurityContext(factory = WithCustomUserSecurityContextFactory::class)
annotation class WithLoggedInUser(val skipPhone: Boolean = false)
