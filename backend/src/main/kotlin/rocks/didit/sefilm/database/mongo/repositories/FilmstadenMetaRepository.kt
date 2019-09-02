package rocks.didit.sefilm.database.mongo.repositories

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import rocks.didit.sefilm.database.mongo.entities.FilmstadenMeta

@Repository
interface FilmstadenMetaRepository : CrudRepository<FilmstadenMeta, String>