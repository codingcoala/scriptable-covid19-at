// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: file-medical-alt;

const localDataByCurrentLocation = (location) => `https://services1.arcgis.com/YfxQKFk1MjjurGb5/arcgis/rest/services/AUSTRIA_COVID19_Cases/FeatureServer/1/query?where=1%3D1&outFields=*&geometry=${location.longitude.toFixed(3)}%2C${location.latitude.toFixed(3)}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=4326&f=json`

const historicalData = (bkz) => `https://services1.arcgis.com/YfxQKFk1MjjurGb5/arcgis/rest/services/AUSTRIA_COVID19_Cases/FeatureServer/4/query?where=BKZ%20%3D%20${bkz}%20&outFields=*&outSR=4326&f=json`

const generalDataAustria = "https://services1.arcgis.com/YfxQKFk1MjjurGb5/arcgis/rest/services/COVID19_VERLAUF_OESTERREICH/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json"

const casesByBundeslandApiUrl = 'https://covid19-dashboard.ages.at/data/JsonData.json'

function createSymbol(name, font) {
    let sym = SFSymbol.named(name)
    sym.applyFont(font)
    return sym
}

let widget = await createWidget()

let location

const saveCurrentLocation = (location) => {
 let fm = FileManager.iCloud()
 let path = fm.joinPath(fm.documentsDirectory(), "latlon.json")
 fm.writeString(path, JSON.stringify(location))
}

const getLastSavedLocation = () => {
 let fm = FileManager.iCloud()
 let path = fm.joinPath(fm.documentsDirectory(), "latlon.json")
 let data = fm.readString(path)
 return JSON.parse(data)
}

//gradient background
let startColor = new Color("#606c88")
let endColor = new Color("#3f4c6b")
let gradient = new LinearGradient()
gradient.colors = [startColor, endColor]
gradient.locations = [0.5, 1]

widget.backgroundGradient = gradient


if (!config.runsInWidget) {
 await widget.presentSmall()
}

Script.setWidget(widget)
Script.complete()

async function createWidget(items) {
    let data, attr, label
    
    /*
    ampelfarbe +
    inzidenz auf bezirksebene +
    aktiv infizierte auf bezriksebene +
    datum letzte aktualisierung +
    */
    
    const list = new ListWidget()
    
    //Österreichweite daten
    data = await new Request(generalDataAustria).loadJSON()
    
    if(!data || !data.features || !data.features.length) {
        const errorList = new ListWidget()
        errorList.addText("Keine Ergebnisse für die Anfrage nach österreichweiten Daten.")
        return errorList
    }
    
    var infizierte_at = data.features[data.features.length-1].attributes.infizierte //106584
    var genesene_at = data.features[data.features.length-1].attributes.genesene //57668
    var verstorbene_at = data.features[data.features.length-1].attributes.verstorbene //1097
    var infizierteAlt_at = data.features[data.features.length-2].attributes.infizierte //101443
    var infizierteDiff_at = infizierte_at - infizierteAlt_at
    
    
    //Lokale Daten auf Bezirksbasis
    Location.setAccuracyToThreeKilometers()
    try {
        location = await Location.current()
        console.log('get current lat/lon')
        saveIncidenceLatLon(location)
    } catch(e) {
        console.log('using saved lat/lon')
        location = getsavedIncidenceLatLon()
    }
    
    data = await new Request(localDataByCurrentLocation(location)).loadJSON()

    if(!data || !data.features || !data.features.length) {
        const errorList = new ListWidget()
        errorList.addText("Keine Ergebnisse für die Anfrage nach Daten auf Bezirksebene.")
        return errorList
    }
    
    if(data.features.length != 1) {
        const errorList = new ListWidget()
        errorList.addText("Keine eindeutige Standortbestimmung möglich.")
        return errorList
    }
    
    var infizierte_bzk = data.features[0].attributes.infizierte
    var infektionsRisiko_bzk = new Array()
    infektionsRisiko_bzk["int"] = data.features[0].attributes.infektionsrisk_int
    infektionsRisiko_bzk["str"] = data.features[0].attributes.infektionsrisk_str
    var inzidenz_bzk = data.features[0].attributes.inzidenz_7t_faelle
    var lastUpdateDate_bzk = new Date(data.features[0].attributes.datum)
    
    var id_bzk = data.features[0].attributes.BKZ
    var name_bzk = data.features[0].attributes.PB
    
    
    //Historische Daten für den Bezirk
    data = await new Request(historicalData(id_bzk)).loadJSON()
    
    if(!data || !data.features || !data.features.length) {
        const errorList = new ListWidget()
        errorList.addText("Keine historischen Daten zu dem Bezirk möglich.")
        return errorList
    }
    
    var infizierteAlt_bzk = data.features[data.features.length-1].attributes.infizierte
    var infizierteDiff_bzk = infizierte_bzk - infizierteAlt_bzk
    
    
    let header = list.addText("🦠 Neuinfektionen ".toUpperCase())
    header.centerAlignText()
    header.font = Font.mediumSystemFont(8)
    
    list.addSpacer()
    
    let hStack1 = list.addStack()
    hStack1.layoutHorizontally()
    hStack1.addSpacer(25)
    hStack1.centerAlignContent()
    
    let symbolfont = Font.semiboldSystemFont(18)
    let sym1 = createSymbol("arrow.up", symbolfont)
    
    let wmig1 = hStack1.addImage(sym1.image)
    wimg1.resizable = false
    wimg1.tintColor = Color.red()
    wimg1.imageSize = new Size(22,22)
    wimg1.centerAlignImage()
    
    hStack1.addSpacer(1)
    
    let label1 = hStack.addText(infizierteDiff_at.toString())
    label1.font = Font.semiboldSystemFont(22)
    label1.centerAlignText()
    
    let countryname = list.addText("Österreich")
    countryname.centerAlignText()
    countryname.font = Font.mediumSystemFont(12)
    
    list.addSpacer()
    
    
    let hStack2 = list.addStack()
    hStack2.layoutHorizontally()
    hStack2.addSpacer(25)
    hStack2.centerAlignContent()

    let sym2 = createSymbol("arrow.up", symbolfont)

    let wimg2 = hStack2.addImage(sym2.image)
    wimg2.resizable = false
    wimg2.tintColor = Color.red()
    wimg2.imageSize = new Size(22,22)
    wimg2.centerAlignImage()
    
    hStack2.addSpacer(1)
    
    let label2 = hStack2.addText(infizierteDiff_bzk.toString())
    label2.font = Font.systemFont(22)
    label2.centerAlignText()
    
    let sym3 = createSymbol("circle.fill", symbolfont)
    
    let wimg3 = hStack2.addImage(sym3.image)
    wimg2.resizable = false
    if(infektionsRisiko_bzk["int"] == 1){
        wimg3.tintColor = Color.green()
    } else if(infektionsRisiko_bzk["int"] == 2){
        wimg3.tintColor = Color.yellow()
    } else if(infektionsRisiko_bzk["int"] == 3){
        wimg3.tintColor = Color.orange()
    } else if(infektionsRisiko_bzk["int"] == 4){
        wimg3.tintColor = Color.red()
    } else {
        wimg3.tintColor = Color.purple()
    }
    wimg2.imageSize = new Size(22,22)
    wimg2.centerAlignImage()
 
    let cityname = list.addText(name_bzk)
    city.centerAlignText()
    city.font = Font.mediumSystemFont(12)
    city.textColor = new Color("#f2f3f4")

    list.addSpacer()
    
    const options = { hour: '2-digit', minute: '2-digit' };
    
    let label3 = list.addText("letztes Update: ")
    label3.centerAlignText()
    label3.font = Font.mediumSystemFont(6)  
    label3 = list.addText(lastUpdateDate_bzk.toLocaleDateString(Device.locale().replace("_", "-"), options))

 return list
}