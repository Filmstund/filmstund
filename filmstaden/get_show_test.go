package filmstaden_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/filmstund/filmstund/filmstaden"
	"gotest.tools/v3/assert"
)

const singleShowResp = `{"time":"2022-01-07T19:25:00+01:00","timeUtc":"2022-01-07T18:25:00Z","remoteSystemAlias":"Sys99-SE","remoteEntityId":"20220107-1925-2783","movie":{"ncgId":"NCG522214","languageId":"sv","title":"The Matrix Resurrections","originalTitle":"The Matrix Resurrections","slug":"the-matrix-resurrections","originalLanguage":"en","originalLanguages":[{"nativeName":"English","englishName":"English","displayName":"Engelska","alias":"en","description":null}],"productionYear":2021,"shortDescription":"Den efterlängtade fjärde filmen i MATRIX-universumet, från den banbrytande franchisen som omdefinierade en genre. Filmen återförenar Keanu Reeves och Carrie-Anne Moss som Neo och Trinity,","longDescription":"Den efterlängtade fjärde filmen i MATRIX-universumet, från den banbrytande franchisen som omdefinierade en genre. Filmen återförenar Keanu Reeves och Carrie-Anne Moss som Neo och Trinity, de ikoniska rollerna de gjorde kända i The Matrix.","longDescriptionFormats":[{"type":"Markdown","text":"Den efterlängtade fjärde filmen i MATRIX-universumet, från den banbrytande franchisen som omdefinierade en genre. Filmen återförenar Keanu Reeves och Carrie-Anne Moss som Neo och Trinity, de ikoniska rollerna de gjorde kända i “The Matrix.”"}],"releaseDate":"2021-12-22T00:00:00","releaseDateInfo":"Biljetter","preReleaseDate":null,"preReleaseDateInfo":null,"reReleaseDate":null,"reReleaseDateInfo":null,"actors":[{"displayName":"Keanu Reeves","firstName":"Keanu","lastName":"Reeves"},{"displayName":"Carrie-Anne Moss","firstName":"Carrie-Anne","lastName":"Moss"},{"displayName":"Jessica Henwick","firstName":"Jessica","lastName":"Henwick"},{"displayName":"Christina Ricci","firstName":"Christina","lastName":"Ricci"},{"displayName":"Yahya Abdul-Mateen II","firstName":"Yahya","lastName":"Abdul-Mateen II"},{"displayName":"Ellen Hollman","firstName":"Ellen","lastName":"Hollman"},{"displayName":"Neil Patrick Harris","firstName":"Neil","lastName":"Patrick Harris"},{"displayName":"Jada Pinkett Smith","firstName":"Jada","lastName":"Pinkett Smith"}],"directors":[{"displayName":"Lana Wachowski","firstName":"Lana","lastName":"Wachowski"}],"roles":[],"producers":[],"genres":[{"name":"Action"},{"name":"Sci-Fi"}],"categories":[],"entityReferences":[],"rating":{"displayName":"11 år","alias":"11","age":11,"ageAccompanied":7},"length":147,"videoStreams":[{"category":"TRAILER","url":"https://trailers.filmstaden.se/asset-4d4c7758-98d9-4b84-83b8-ef8425212241/TheMatrixResurrections_trailer2_1280x720.mp4","description":"Trailer","image":null}],"posterUrl":"https://catalog.cinema-api.com/cf/images/ncg-images/83a647a9bf5a4f1ab1520210cd8f29c7.jpg?width=1440&version=FFC14568CDEE5503DEDDB7EEB3FC2940","images":[{"fileName":"83a647a9bf5a4f1ab1520210cd8f29c7.jpg","size":942711,"height":2161,"width":1440,"version":2,"altText":null,"caption":null,"copyright":null,"id":"83a647a9bf5a4f1ab1520210cd8f29c7","imageType":"Poster","contentType":"image/jpeg","url":"https://catalog.cinema-api.com/cf/images/ncg-images/83a647a9bf5a4f1ab1520210cd8f29c7.jpg?width=1440&version=FFC14568CDEE5503DEDDB7EEB3FC2940","alternatives":[{"contentType":"image/webp","url":"https://catalog.cinema-api.com/cf/images/ncg-images/83a647a9bf5a4f1ab1520210cd8f29c7.jpg?width=1440&version=FFC14568CDEE5503DEDDB7EEB3FC2940&format=webp"}]},{"fileName":"20a6820f62eb4c5d856a197e588ea8d9.jpg","size":459138,"height":810,"width":1920,"version":3,"altText":null,"caption":null,"copyright":null,"id":"20a6820f62eb4c5d856a197e588ea8d9","imageType":"Hero","contentType":"image/jpeg","url":"https://catalog.cinema-api.com/cf/images/ncg-images/20a6820f62eb4c5d856a197e588ea8d9.jpg?width=1920&version=D3BC43515EEB712C50131B29E7D7BDBA","alternatives":[{"contentType":"image/webp","url":"https://catalog.cinema-api.com/cf/images/ncg-images/20a6820f62eb4c5d856a197e588ea8d9.jpg?width=1920&version=D3BC43515EEB712C50131B29E7D7BDBA&format=webp"}]},{"fileName":"f7235fd56e9343e8bf7ccae7c25674e9.jpg","size":214297,"height":938,"width":750,"version":3,"altText":null,"caption":null,"copyright":null,"id":"f7235fd56e9343e8bf7ccae7c25674e9","imageType":"HeroPortrait","contentType":"image/jpeg","url":"https://catalog.cinema-api.com/cf/images/ncg-images/f7235fd56e9343e8bf7ccae7c25674e9.jpg?width=750&version=B06D63813159D876F1F197861991E991","alternatives":[{"contentType":"image/webp","url":"https://catalog.cinema-api.com/cf/images/ncg-images/f7235fd56e9343e8bf7ccae7c25674e9.jpg?width=750&version=B06D63813159D876F1F197861991E991&format=webp"}]},{"fileName":"593f56eabf3a4c1fb0ce31d8503c9741.jpg","size":279682,"height":810,"width":1920,"version":2,"altText":null,"caption":null,"copyright":null,"id":"593f56eabf3a4c1fb0ce31d8503c9741","imageType":"StillFrame","contentType":"image/jpeg","url":"https://catalog.cinema-api.com/cf/images/ncg-images/593f56eabf3a4c1fb0ce31d8503c9741.jpg?width=1920&version=65C63B9A95A6B98643C5803906BFE66A","alternatives":[{"contentType":"image/webp","url":"https://catalog.cinema-api.com/cf/images/ncg-images/593f56eabf3a4c1fb0ce31d8503c9741.jpg?width=1920&version=65C63B9A95A6B98643C5803906BFE66A&format=webp"}]},{"fileName":"803f12ec16b647349ce818ff82cee4de.jpg","size":502948,"height":810,"width":1920,"version":2,"altText":null,"caption":null,"copyright":null,"id":"803f12ec16b647349ce818ff82cee4de","imageType":"StillFrame","contentType":"image/jpeg","url":"https://catalog.cinema-api.com/cf/images/ncg-images/803f12ec16b647349ce818ff82cee4de.jpg?width=1920&version=6AE2BA03C13BBB1FE333A5B92C2B77C0","alternatives":[{"contentType":"image/webp","url":"https://catalog.cinema-api.com/cf/images/ncg-images/803f12ec16b647349ce818ff82cee4de.jpg?width=1920&version=6AE2BA03C13BBB1FE333A5B92C2B77C0&format=webp"}]}],"seoTitle":"Se \"The Matrix Resurrections\" på bio - Köp biobiljett online | Filmstaden","seoDescription":"Den efterlängtade fjärde filmen i MATRIX-universumet, från den banbrytande franchisen som omdefinierade en genre. Filmen återförenar Keanu Reeves och Carrie-Anne Moss som Neo och Trinity, | filmstaden","specialMovie":false},"movieVersion":{"title":"The Matrix Resurrections","slug":"the-matrix-resurrections","languageId":"sv","releaseDate":"2021-12-22T00:00:00","audioLanguage":"en","audioLanguageInfo":{"displayName":"Engelska","alias":"en","name":"en","threeLetterISOLanguageName":"eng","description":""},"subtitlesLanguage":"sv-SE","subtitlesLanguageInfo":{"displayName":"Svenska","alias":"sv","name":"sv-SE","threeLetterISOLanguageName":"sve","description":"Filmen är textad på svenska"},"attributes":[],"ncgId":"NCG522214V1","remoteSystemAlias":"Sys99-SE","remoteEntityId":"19582","rating":{"displayName":"11 år","alias":"11","age":11,"ageAccompanied":7},"audioLanguages":[{"displayName":"Engelska","alias":"en","name":"en","threeLetterISOLanguageName":"eng","description":"Engelskt tal, \nEnglish dialogue"}],"partnerShow":false,"partnerCode":null},"attributes":[{"alias":"5.1","displayName":"5.1","description":null}],"isRestricted":false,"unnumbered":false,"canPayWithPoints":true,"purchaseMemberAllowed":true,"purchaseMemberAllowedStatus":0,"auditoriumLayoutId":"2783","mainAccount":2009,"movieVersionPrice":159.00000,"memberPointPrice":1400,"cinema":{"ncgId":"NCG27333","languageId":"sv","title":"Biopalatset","company":{"name":"Filmstaden","legalName":"Filmstaden AB","organizationNumber":"556035-1651","webSite":"www.filmstaden.se","purchaseCinemaOwnerInformation":"Dina biljetter bifogas i detta mail och du behöver inte hämta ut dem på biografen. Om du köper biljetterna som inloggad medlem hittar du dem också under fliken \"Mina sidor\" i Filmstadens app. Gå direkt till insläppet och visa upp biljetterna i din mobiltelefon eller som utskriven pdf. Välkommen till Filmstaden!","purchaseCinemaInformation":"Återköp av biljetter medges ej efter föreställningsstart","handicapSeatHeading":"Detta är en rullstolsplats","handicapSeatInfo":"Platsen du har valt är för besökande med funktionsnedsättning och dess ledsagare.","handicapPlaceHeading":"Detta är en rullstolsplatta","handicapPlaceInfo":"Platsen du har valt är för besökande med funktionsnedsättning och dess ledsagare.","address":{"phoneNumber":"08-680 35 00","streetAddress":null,"postalCode":"169 86","postalAddress":"Stockholm","city":{"name":"Stockholm","alias":"SE"},"country":{"displayName":"Sverige","name":"se","alias":"se"},"coordinates":{"latitude":59.3671135,"longitude":17.9818236}},"alias":"SF","languageId":"sv","eTicketSettings":{"senderSettings":{"emailAddress":"noreply@filmstaden.se","displayName":"Filmstaden"}},"images":[{"fileName":"6eca2327fd0e4ccfbea7ad40c216ebcf.png","size":2021,"height":120,"width":120,"version":19,"altText":"","caption":"","copyright":null,"id":"6eca2327fd0e4ccfbea7ad40c216ebcf","imageType":"LogoOnWhiteBackground","contentType":"image/png","url":"https://catalog.cinema-api.com/cf/images/ncg-images/6eca2327fd0e4ccfbea7ad40c216ebcf.png?width=120&version=D2D58D1A0B908353F9948DB7CA43774E","alternatives":[{"contentType":"image/webp","url":"https://catalog.cinema-api.com/cf/images/ncg-images/6eca2327fd0e4ccfbea7ad40c216ebcf.png?width=120&version=D2D58D1A0B908353F9948DB7CA43774E&format=webp"}]}]},"address":{"phoneNumber":null,"streetAddress":"Kungstorget 2","postalCode":"411 16","postalAddress":"Göteborg","city":{"name":null,"alias":"GB"},"country":{"displayName":"Sverige","name":"se","alias":"se"},"coordinates":{"latitude":57.7034822788479,"longitude":11.966814994812}},"shortDescription":"Biopalatset har tio salonger med totalt 1143 fåtöljer. Biografen är kontantfri.","longDescription":" Vaccinationsbevis för Covid-19 På Biopalatset krävs från 23 december uppvisande av vaccinationsbevis för Covid-19 tillsammans med ID-handling i samtliga salonger.   We make movies better  Att se film i en biograf är att låta sig omslutas av berättelsen. Långt från vardagen och utan oönskade avbrott, i en miljö som både är något utöver det vanliga och samtidigt känns som hemma. En upplevelse som lever kvar långt efter att sluttexterna rullat.   Kort om biografen Biopalatset har tio salonger med totalt 1143 platser.   Popcorn, snacks, godis och läsk Biografen har en butik med ett urval av godis, snacks, popcorn och olika sorters dricka. Här finns produkter från Marabou, Coca Cola, Cloetta, Bubs och mycket mer.   Biografen är kontantfri Biljetter köper du enkelt via filmstaden.se eller i vår app. Du kan också köpa digitala presentkort på filmstaden.se. På biografen går det bra att betala med de vanligaste kontokorten, Filmstadens presentkort, Apple pay och Samsung pay.  Biografen stänger 15 minuter efter att sista föreställning startat.","longDescriptionFormats":[{"type":"Markdown","text":"#### Vaccinationsbevis för Covid-19\nPå Biopalatset krävs från 23 december uppvisande av vaccinationsbevis för Covid-19 tillsammans med ID-handling i samtliga salonger.\n\n#### We make movies better\n\n*Att se film i en biograf är att låta sig omslutas av berättelsen. Långt från vardagen och utan oönskade avbrott, i en miljö som både är något utöver det vanliga och samtidigt känns som hemma. En upplevelse som lever kvar långt efter att sluttexterna rullat.*\n\n#### Kort om biografen\nBiopalatset har tio salonger med totalt 1143 platser.\n\n#### Popcorn, snacks, godis och läsk\nBiografen har en butik med ett urval av godis, snacks, popcorn och olika sorters dricka. Här finns produkter från Marabou, Coca Cola, Cloetta, Bubs och mycket mer.\n\n#### Biografen är kontantfri\nBiljetter köper du enkelt via filmstaden.se eller i vår app. Du kan också köpa digitala presentkort på filmstaden.se. På biografen går det bra att betala med de vanligaste kontokorten, Filmstadens presentkort, Apple pay och Samsung pay.\n\nBiografen stänger 15 minuter efter att sista föreställning startat."}],"openingHours":{"monday":{"from":{"hour":12,"minute":0},"to":{"hour":20,"minute":30}},"tuesday":{"from":{"hour":16,"minute":0},"to":{"hour":20,"minute":30}},"wednesday":{"from":{"hour":16,"minute":0},"to":{"hour":20,"minute":30}},"thursday":{"from":{"hour":10,"minute":30},"to":{"hour":22,"minute":0}},"friday":{"from":{"hour":10,"minute":30},"to":{"hour":22,"minute":0}},"saturday":{"from":{"hour":10,"minute":30},"to":{"hour":22,"minute":0}},"sunday":{"from":{"hour":10,"minute":30},"to":{"hour":20,"minute":30}},"deviations":[{"title":"7 jun","date":{"year":2021,"month":6,"day":7},"from":{"hour":16,"minute":0},"to":{"hour":20,"minute":45}},{"title":"8 jun","date":{"year":2021,"month":6,"day":8},"from":{"hour":16,"minute":0},"to":{"hour":20,"minute":45}},{"title":"9 jun","date":{"year":2021,"month":6,"day":9},"from":{"hour":16,"minute":0},"to":{"hour":20,"minute":45}},{"title":"10 jun","date":{"year":2021,"month":6,"day":10},"from":{"hour":16,"minute":0},"to":{"hour":20,"minute":45}},{"title":"11 jun","date":{"year":2021,"month":6,"day":11},"from":{"hour":14,"minute":0},"to":{"hour":22,"minute":15}},{"title":"12 jun","date":{"year":2021,"month":6,"day":12},"from":{"hour":11,"minute":30},"to":{"hour":22,"minute":15}},{"title":"13 jun","date":{"year":2021,"month":6,"day":13},"from":{"hour":11,"minute":30},"to":{"hour":20,"minute":45}}]},"threeDimensionalGlassesInformation":null,"lostAndFoundInformation":null,"purchaseInformation":null,"images":[{"fileName":"e003c235a90c420da9a535df16f5c06a.jpg","size":674265,"height":810,"width":1920,"version":20,"altText":"","caption":"","copyright":null,"id":"e003c235a90c420da9a535df16f5c06a","imageType":"Hero","contentType":"image/jpeg","url":"https://catalog.cinema-api.com/cf/images/ncg-images/e003c235a90c420da9a535df16f5c06a.jpg?width=1920&version=142D0F48841F7527F0A2F2844E1076F0","alternatives":[{"contentType":"image/webp","url":"https://catalog.cinema-api.com/cf/images/ncg-images/e003c235a90c420da9a535df16f5c06a.jpg?width=1920&version=142D0F48841F7527F0A2F2844E1076F0&format=webp"}]}],"slug":"biopalatset","remoteSystemAlias":"Sys99-SE","remoteEntityId":"172","seoTitle":"Bio på Biopalatset i Göteborg - Köp biobiljetter online | Filmstaden","seoDescription":"Välkommen till Biopalatset i Göteborg som drivs av Filmstaden. Biografens öppettider och föreställningsschema uppdateras veckovis.","allowHandicapSeat":false,"allowHandicapPlace":false,"headphoneInformation":null,"wheelchairInformation":"Biografen är anpassad för tillgänglighet. För reservation av rullstolsplatser, ring: 08-56 26 00 00."},"screen":{"ncgId":"NCG27333S5","title":"Salong 5","slug":"salong-5","languageId":"sv","attributes":[{"alias":"5.1","displayName":"5.1","description":null}],"supportedMovieVersionAttributes":[{"alias":"100 Ugå(2)","displayName":"100 Ugå","description":null},{"alias":"2D","displayName":"2D","description":null},{"alias":"3D+","displayName":"3D+","description":"60 bilder per sekund, ett bilddjup och en skärpa du aldrig upplevt tidigare."},{"alias":"Barnvagnsbio","displayName":"Barnvagnsbio","description":"Om filmen är barntillåten eller från 7 år får bebis upp till 2 år följa med gratis. Vid högre åldersgräns får bebis upp till 1 år följa med gratis."},{"alias":"Besök","displayName":"Besök","description":null},{"alias":"Biopasset","displayName":"Biopasset","description":"Filmen ingår i Biopasset"},{"alias":"Black Weekend","displayName":"Black Weekend","description":null},{"alias":"Bollywood","displayName":"Bollywood","description":null},{"alias":"Cinematek","displayName":"Cinematek","description":null},{"alias":"Classic","displayName":"Klassiker","description":"Filmerna man aldrig glömmer. Milstolpar, kultrullar och barndomsminnen."},{"alias":"Concert","displayName":"Konsert","description":null},{"alias":"Den Store Fjordkraftdagen","displayName":"Den Store Fjordkraftdagen","description":null},{"alias":"Den Store Viken Fiber Dagen","displayName":"Den Store Viken Fiber Dagen","description":null},{"alias":"Direkt","displayName":"Direkt","description":"Direktsändning från evenemanget."},{"alias":"Disney","displayName":"Disney","description":null},{"alias":"Documentary","displayName":"Dokumentär","description":null},{"alias":"DSK","displayName":"Den Store Kinodageg","description":null},{"alias":"Family","displayName":"Familj","description":"Filmer för hela familjen, för de allra yngsta biobesökarna och för lite större barn."},{"alias":"Foreningen Norden","displayName":"Foreningen Norden","description":null},{"alias":"Forhåndssalg","displayName":"Forhåndssalg","description":null},{"alias":"Gala premiere","displayName":"Gala","description":null},{"alias":"Halloween","displayName":"Halloween","description":null},{"alias":"Illumination-festival","displayName":"Illumination-festival","description":null},{"alias":"Inspelad","displayName":"Inspelad","description":null},{"alias":"Italiensk filmfestival","displayName":"Italiensk filmfestival","description":null},{"alias":"Knattebio","displayName":"Knattebio","description":null},{"alias":"Kunst på Kino","displayName":"Kunst på Kino","description":null},{"alias":"Live","displayName":"Live","description":"Live på biografen."},{"alias":"Medlemsvisning","displayName":"Medlemsvisning","description":null},{"alias":"Miyazaki x 10","displayName":"Miyazaki x 10","description":null},{"alias":"Møt filmkunstneren","displayName":"Møt filmkunstneren","description":null},{"alias":"Møt Karl-Bertil","displayName":"Møt Karl-Bertil","description":null},{"alias":"Musikal","displayName":"Musikal","description":null},{"alias":"OBOS","displayName":"OBOS","description":null},{"alias":"Obs","displayName":"Obs","description":null},{"alias":"Opera-Balett","displayName":"Opera-Balett","description":"Se föreställningar från de stora scenerna i din biograf."},{"alias":"Over Oslo","displayName":"Over Oslo","description":null},{"alias":"Premiere","displayName":"NO","description":null},{"alias":"Pride","displayName":"Pride","description":null},{"alias":"Samiskt tal","displayName":"Samiskt tal","description":null},{"alias":"Sansevennlig","displayName":"Autism-friendly","description":null},{"alias":"Seniorfestival","displayName":"Seniorfestival","description":null},{"alias":"Seniorkino","displayName":"Seniorkino","description":null},{"alias":"Sing-a-long","displayName":"Sing-a-long","description":"Publiken sjunger med och skapar en kväll utöver det vanliga, tillsammans med en sångledare och de klassiska textremsorna."},{"alias":"Smygpremiär","displayName":"Smygpremiär","description":"Se filmen innan den ordinarie premiären."},{"alias":"Sommar pa bio","displayName":"Sommar på bio","description":null},{"alias":"Sport","displayName":"Sport","description":null},{"alias":"Stand-up","displayName":"Stand-up","description":null},{"alias":"Store Filmopplevelser","displayName":"Store Filmopplevelser","description":null},{"alias":"Storfilm","displayName":"Storfilm","description":null},{"alias":"Storo-dagene","displayName":"Storo-dagene","description":null},{"alias":"Strikkekino","displayName":"Strikkekino","description":null},{"alias":"Studentkino","displayName":"Studentkino","description":null},{"alias":"Svartvit","displayName":"Svart/vit","description":"Filmen visas i svart/vit format."},{"alias":"Syntolkning","displayName":"Syntolkning","description":"Användare av tjänsten syntolkning tar del av ljudspåret med sina mobilhörlurar/headset och övrig publik påverkas därmed inte."},{"alias":"Tamil","displayName":"Tamil","description":null},{"alias":"Theatre","displayName":"Teater","description":null},{"alias":"Trylleshow!","displayName":"Trylleshow","description":null},{"alias":"Ukrainsk filmfestival","displayName":"Ukrainsk filmfestival","description":null},{"alias":"Uppläst text","displayName":"Uppläst text","description":"Användare av tjänsten uppläst text tar del av ljudspåret med sina mobilhörlurar/headset och övrig publik påverkas därmed inte."},{"alias":"Utmärkt film","displayName":"Utmärkt film","description":"Kritikerrosade och prisbelönta filmer från hela världen. Riktigt bra film som stannar kvar längre."}],"longDescription":"Salongen har 87 platser på 8 rader. Avståndet från första raden till duken är 3 meter. Dukstorlek: 6,5 m x 3 m.  Salongen är anpassad för rullstol. För reservation av rullstolsplatser, ring: 08-56 26 00 00. Till salongen tar man sig med hiss. från entrén på bottenplan. Salongen tar permobil. Hörslinga finns.","longDescriptionFormats":[{"type":"Markdown","text":"Salongen har 87 platser på 8 rader. Avståndet från första raden till duken är 3 meter. Dukstorlek: 6,5 m x 3 m.\n\nSalongen är anpassad för rullstol. För reservation av rullstolsplatser, ring: 08-56 26 00 00. Till salongen tar man sig med hiss. från entrén på bottenplan. Salongen tar permobil. Hörslinga finns."}],"threeDimensionalGlassesInformation":"","seatingInformation":null,"seatCount":87,"sortOrder":0,"remoteSystemAlias":"Sys99-SE","remoteEntityId":"493","rating":null,"displayPurchaseCondition":false,"purchaseScreenInformation":"Salongen du har bokat har fler än 100 platser. Alla över 18 år behöver därför visa upp ett giltigt vaccinationsbevis för Covid-19 utfärdat i EU och giltigt foto-ID vid besöket. Tänk på att komma till biografen i tid och ha dokumenten beredda då köer kan uppstå.\n\nThe auditorium you chose has a capacity of 100 or more. Everyone aged 18 or more is required to present a valid vaccination certificate issued within EU and a valid identity document with photo to visit. Please allow for an easier access by arriving in good time."},"restrictions":[],"customerTypes":[],"availableProducts":[],"availableCardTypes":["GiftCertificate"],"availableMembershipPointOptionTypes":["Pay","Collect"],"childAndSeniorTypes":{"senior":{"id":15,"namedDiscountPublicId":"NYPE","publicName":"Pensionärsrabatt 20%","shortPublicName":"PNSNR","description":"65 år eller mot uppvisande av intyg","discountCode":"NYPE","operation":"PERCENT","validFrom":"1999-12-08T00:00:00+01:00[Europe/Stockholm]","validTo":"2099-12-31T23:59:00+01:00[Europe/Stockholm]","value":0.20},"child":null},"discountCodeAllowed":true,"giftCardAllowed":true}`

func TestClient_Show(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, err := w.Write([]byte(singleShowResp))
		assert.NilError(t, err)
	}))
	defer srv.Close()

	client := filmstaden.NewClient(srv.URL, NoopCache())
	show, err := client.Show(context.Background(), "20220107-1925-2783")
	assert.NilError(t, err)
	assert.Equal(t, show.RemoteEntityID, "20220107-1925-2783")
	assert.Equal(t, show.Screen.NcgID, "NCG27333S5")
	assert.Equal(t, show.Screen.Title, "Salong 5")
}
