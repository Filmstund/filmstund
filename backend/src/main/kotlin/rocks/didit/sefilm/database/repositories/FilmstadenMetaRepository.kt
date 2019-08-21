package rocks.didit.sefilm.database.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.entities.FilmstadenMeta

@Repository
interface FilmstadenMetaRepository : CrudRepository<FilmstadenMeta, String>