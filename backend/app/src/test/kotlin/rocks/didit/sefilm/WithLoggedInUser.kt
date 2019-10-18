package rocks.didit.sefilm

import org.springframework.security.test.context.support.WithSecurityContext

@Retention(AnnotationRetention.RUNTIME)
@WithSecurityContext(factory = WithCustomUserSecurityContextFactory::class)
annotation class WithLoggedInUser(val skipPhone: Boolean = false)
