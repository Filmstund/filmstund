package rocks.didit.sefilm.managers

import org.junit.Assert
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito
import org.mockito.junit.MockitoJUnitRunner
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.services.MovieService
import rocks.didit.sefilm.services.SlugService

@RunWith(MockitoJUnitRunner.StrictStubs::class)
class SlugServiceTest {

    @Mock
    private lateinit var movieServiceoMock: MovieService

    @InjectMocks
    private lateinit var slugService: SlugService

    @Test
    fun testGenerateSlugForShowing() {
        val expectedSlugs = listOf(
                Pair("Atomic Blonde", "atomic-blonde"),
                Pair("A United Kingdom", "a-united-kingdom"),
                Pair("Alien", "alien"),
                Pair("Alien: Covenant", "alien-covenant"),
                Pair("All Eyez on Me", "all-eyez-on-me"),
                Pair("Annabelle: Creation", "annabelle-creation"),
                Pair("Apornas planet: Striden", "apornas-planet-striden"),
                Pair("Baby Driver", "baby-driver"),
                Pair("Baby-bossen", "babybossen"),
                Pair("Bamse och häxans dotter", "bamse-och-haxans-dotter"),
                Pair("Baywatch", "baywatch"),
                Pair("Bigfoot Junior", "bigfoot-junior"),
                Pair("Bilar 3", "bilar-3"),
                Pair("Blade Runner 2049", "blade-runner-2049"),
                Pair("Borg vs McEnroe", "borg-vs-mcenroe"),
                Pair("Brev från månen", "brev-fran-manen"),
                Pair("Coco", "coco"),
                Pair("Darkland", "darkland"),
                Pair("De bedragna", "de-bedragna"),
                Pair("Win It All", "win-it-all"),
                Pair("Dolda tillgångar", "dolda-tillgangar"),
                Pair("Dumma mej 3", "dumma-mej-3"),
                Pair("Dunkirk", "dunkirk"),
                Pair("En flodhäst i tesalongen", "en-flodhast-i-tesalongen"),
                Pair("En obekväm uppföljare", "en-obekvam-uppfoljare"),
                Pair("Fast & Furious 8", "fast-and-furious-8"),
                Pair("Flyg sa Alfons Åberg", "flyg-sa-alfons-aberg"),
                Pair("Frantz", "frantz"),
                Pair("För min dotters skull", "for-min-dotters-skull"),
                Pair("Galna av lycka", "galna-av-lycka"),
                Pair("Get Out", "get-out"),
                Pair("Ghost in the Shell", "ghost-in-the-shell"),
                Pair("Guardians of the Galaxy, vol. 2", "guardians-of-the-galaxy-vol.-2"),
                Pair("Half Girlfriend", "half-girlfriend"),
                Pair("Ingenting och allting", "ingenting-och-allting"),
                Pair("Inte hela världen", "inte-hela-varlden"),
                Pair("It comes at night", "it-comes-at-night"),
                Pair("Jacques - Havets utforskare", "jacques--havets-utforskare"),
                Pair("Justice League", "justice-league"),
                Pair("King Arthur: Legend of the Sword", "king-arthur-legend-of-the-sword"),
                Pair("Kingsman: The Golden Circle", "kingsman-the-golden-circle"),
                Pair("Klas Klättermus och de andra djuren i Hackebackeskogen", "klas-klattermus-och-de-andra-djuren-i-hackeba"),
                Pair("Kong: Skull Island", "kong-skull-island"),
                Pair("Kungens val", "kungens-val"),
                Pair("Kärleken och evigheten", "karleken-och-evigheten"),
                Pair("La La Land", "la-la-land"),
                Pair("Life", "life"),
                Pair("Lion", "lion"),
                Pair("Logan", "logan"),
                Pair("Logan Lucky", "logan-lucky"),
                Pair("Lost in Paris", "lost-in-paris"),
                Pair("Milo - Månvaktaren", "milo--manvaktaren"),
                Pair("Paris Can Wait", "paris-can-wait"),
                Pair("Pingvinresan 2", "pingvinresan-2"),
                Pair("Pirates of the Caribbean: Salazar's Revenge", "pirates-of-the-caribbean-salazars-revenge"),
                Pair("Raula", "raula"),
                Pair("Rough Night", "rough-night"),
                Pair("Rum 213", "rum-213"),
                Pair("Sameblod", "sameblod"),
                Pair("Skönheten och odjuret", "skonheten-och-odjuret"),
                Pair("Sleepless", "sleepless"),
                Pair("Smurfs: The Lost Village", "smurfs-the-lost-village"),
                Pair("Song to Song", "song-to-song"),
                Pair("Souvenir", "souvenir"),
                Pair("Spider-Man: Homecoming", "spiderman-homecoming"),
                Pair("Star Wars: The Last Jedi", "star-wars-the-last-jedi"),
                Pair("Superswede", "superswede"),
                Pair("The Belko Experiment", "the-belko-experiment"),
                Pair("The Circle", "the-circle"),
                Pair("The Dark Tower", "the-dark-tower"),
                Pair("The Emoji Movie", "the-emoji-movie"),
                Pair("The Handmaiden", "the-handmaiden"),
                Pair("The Hitman's Bodyguard", "the-hitmans-bodyguard"),
                Pair("The LEGO Ninjago Movie", "the-lego-ninjago-movie"),
                Pair("The Mummy", "the-mummy"),
                Pair("The Nile Hilton Incident", "the-nile-hilton-incident"),
                Pair("The Promise", "the-promise"),
                Pair("Their finest hour", "their-finest-hour"),
                Pair("Thor: Ragnarok", "thor-ragnarok"),
                Pair("Ferdinand", "ferdinand"),
                Pair("Transformers: The Last Knight", "transformers-the-last-knight"),
                Pair("Tubelight", "tubelight"),
                Pair("Tulpanfeber", "tulpanfeber"),
                Pair("Ture och Jerry", "ture-och-jerry"),
                Pair("Vaiana", "vaiana"),
                Pair("Valerian and the City of a Thousand Planets", "valerian-and-the-city-of-a-thousand-planets"),
                Pair("Wonder Woman", "wonder-woman"),
                Pair("Vår tid ska komma", "var-tid-ska-komma"),
                Pair("Your Name", "your-name"),
                Pair("Fyren mellan haven", "fyren-mellan-haven"),
                Pair("Moonlight", "moonlight"),
                Pair("Oskars Amerika", "oskars-amerika"),
                Pair("The Bar", "the-bar"),
                Pair("Vad döljer du för mig?", "vad-doljer-du-for-mig?"),
                Pair("Alfons leker Einstein", "alfons-leker-einstein"),
                Pair("Couples Retreat", "couples-retreat"),
                Pair("American Made", "american-made"),
                Pair("Ballerina", "ballerina"),
                Pair("The Midwife", "the-midwife"),
                Pair("Becker - Kungen av Tingsryd", "becker--kungen-av-tingsryd"),
                Pair("Fireman Sam: Alien Alert!", "fireman-sam-alien-alert!"),
                Pair("Electric Bannana Band - En Familjeföreställning", "electric-bannana-band--en-familjeforestallnin"),
                Pair("En kvinnas martyrium", "en-kvinnas-martyrium"),
                Pair("Euphoria", "euphoria"),
                Pair("Fanny's Journey", "fannys-journey"),
                Pair("Stefan Zweig: Farewell to Europe", "stefan-zweig-farewell-to-europe"),
                Pair("Flatliners", "flatliners"),
                Pair("Orphan", "orphan"),
                Pair("Guldfeber", "guldfeber"),
                Pair("Happy Death Day", "happy-death-day"),
                Pair("Heartstone", "heartstone"),
                Pair("Hampstead", "hampstead"),
                Pair("Hiss till galgen", "hiss-till-galgen"),
                Pair("Hockney - Landscape, portraits and still life", "hockney--landscape-portraits-and-still-life"),
                Pair("Two Is a Family", "two-is-a-family"),
                Pair("Jakten på den försvunna skatten", "jakten-pa-den-forsvunna-skatten"),
                Pair("Jordgubbslandet", "jordgubbslandet"),
                Pair("Jumanji: Welcome to the Jungle", "jumanji-welcome-to-the-jungle"),
                Pair("A War", "a-war"),
                Pair("150 Milligrams", "150-milligrams"),
                Pair("Lady M", "lady-m"),
                Pair("Loving Vincent", "loving-vincent"),
                Pair("Matisse", "matisse"),
                Pair("Maudie", "maudie"),
                Pair("Mordet på Orientexpressen", "mordet-pa-orientexpressen"),
                Pair("My Cousin Rachel", "my-cousin-rachel"),
                Pair("My Little Pony: The Movie", "my-little-pony-the-movie"),
                Pair("Märta Proppmätt", "marta-proppmatt"),
                Pair("On the Milky Road", "on-the-milky-road"),
                Pair("Ouaga Girls", "ouaga-girls"),
                Pair("Paddington 2", "paddington-2"),
                Pair("Para knas", "para-knas"),
                Pair("Pianot", "pianot"),
                Pair("Pitch Perfect 3", "pitch-perfect-3"),
                Pair("Pop Aye", "pop-aye"),
                Pair("Rovdjuret", "rovdjuret"),
                Pair("Silvana - Väck mig när ni vaknat", "silvana--vack-mig-nar-ni-vaknat"),
                Pair("Suspiria: Flykten från helvetet", "suspiria-flykten-fran-helvetet"),
                Pair("Så länge hjärtat kan slå", "sa-lange-hjartat-kan-sla"),
                Pair("The Big Sick", "the-big-sick"),
                Pair("The Greatest Showman", "the-greatest-showman"),
                Pair("The Man With the Iron Heart", "the-man-with-the-iron-heart"),
                Pair("The Mountain Between Us", "the-mountain-between-us"),
                Pair("The Shining", "the-shining"),
                Pair("The Square", "the-square"),
                Pair("The Trip to Spain", "the-trip-to-spain"),
                Pair("Tillbaka till Montauk", "tillbaka-till-montauk"),
                Pair("Verónica", "veronica"),
                Pair("Victoria and Abdul", "victoria-and-abdul"),
                Pair("Villebråd", "villebrad"),
                Pair("Wish Upon", "wish-upon"),
                Pair("År 2001: Ett rymdäventyr", "ar-2001-ett-rymdaventyr"),
                Pair("Good Time", "good-time"),
                Pair("Neruda", "neruda"),
                Pair("Om själ och kropp", "om-sjal-och-kropp"),
                Pair("Snömannen", "snomannen"),
                Pair("Table 19", "table-19"),
                Pair("Ted - För kärlekens skull", "ted--for-karlekens-skull"),
                Pair("Trafikljusen blir blå i morgon", "trafikljusen-blir-bla-i-morgon"),
                Pair("American Assassin", "american-assassin"),
                Pair("Black Panther", "black-panther"),
                Pair("Carmen MET", "carmen-met"),
                Pair("Ett veck i tiden", "ett-veck-i-tiden"),
                Pair("Home Again - Kärleken flyttar in", "home-again--karleken-flyttar-in"),
                Pair("Kedi", "kedi"),
                Pair("Ready Player One", "ready-player-one"),
                Pair("L'empereur", "lempereur"),
                Pair("Éternité", "eternite"),
                Pair("Teströl és lélekröl", "testrol-es-lelekrol"),
                Pair("Winnerbäck - Ett slags liv", "winnerback--ett-slags-liv")
        )

        expectedSlugs.forEach {
            val (movieName, expectedSlug) = it
            testGenerateSlugForShowing(movieName, expectedSlug)
        }

    }

    @Suppress("NULLABILITY_MISMATCH_BASED_ON_JAVA_ANNOTATIONS")
    private fun testGenerateSlugForShowing(movieName: String, expectedSlug: String) {
        val movie = Movie(title = movieName)
        val showing = Showing(movie = movie)

        Mockito.`when`(movieServiceoMock.getMovieOrThrow(Mockito.any())).thenReturn(movie)

        val generatedSlug = slugService.generateSlugFor(showing)
        Assert.assertEquals("Expected slug to be $expectedSlug for $movieName", expectedSlug, generatedSlug)
    }

}