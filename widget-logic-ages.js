// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: hand-holding-heart;

// Variables
/// Data Source
const agesDataJSON = 'https://covid19-dashboard.ages.at/data/JsonData.json'

/// Default County
const defaultArea = 9

/// Gradient Backround Colour Settings
const startColor = new Color("#606c88")
const endColor = new Color("#3f4c6b")

// Functions
function createSymbol(name, font) {
  const sym = SFSymbol.named(name)
  sym.applyFont(font)
  return sym
}

async function initializeWidget () {
  try {
    const widget = await createWidget()

    // gradient background
    const gradient = new LinearGradient()
    gradient.colors = [startColor, endColor]
    gradient.locations = [0.5, 1]
    widget.backgroundGradient = gradient

    if (!config.runsInWidget) {
      await widget.presentSmall()
    }

    Script.setWidget(widget)
    Script.complete()
  } catch (e) {
    console.log(e)
  }
}

async function getGlobalData (path) {
  try {
    const data = await new Request(path).loadJSON()
    return data;
  } catch (e) {
    console.log(e)
  }
}

function convertDate (dateString) {
  const datetime = dateString.split(' ')
  const date = datetime[0].split('.')
  const returnDate = new Date(Date.parse(date[2] + '-' + date[1] + '-' + date[0] + 'T' + datetime[1] + '+01:00'))
  return returnDate
}

async function createWidget (items) {
  let area
  const globalData = getGlobalData(agesDataJSON)

  if (!globalData || !globalData.VersionsNr || !globalData.VersionsNr.length) {
    const errorList = new ListWidget()
    errorList.addText('No results for country wide data')
    return errorList
  }

  // isplay Headline
  const list = new ListWidget()

  const headerStack = list.addStack()

  const header = headerStack.addText('🦠 Best. Infizierte'.toUpperCase())
  header.centerAlignText()
  header.font = Font.mediumSystemFont(10)

  list.addSpacer(5)

  // Data Austria
  let filteredData = globalData.CovidFaelle_Timeline.filter(function (f) {
    return f.BundeslandID === 10
  })

  // Display data Austria
  const hStack1 = list.addStack()
  hStack1.layoutHorizontally()
  hStack1.centerAlignContent()

  const symbolfont = Font.semiboldSystemFont(8)
  const sym1 = createSymbol('arrow.up', symbolfont)

  let label0 = hStack1.addText(filteredData[filteredData.length - 1].AnzahlFaelleSum.toString())
  label0.font = Font.semiboldSystemFont(22)
  label0.centerAlignText()

  hStack1.addSpacer(2)

  let wimg1 = hStack1.addImage(sym1.image)
  wimg1.resizable = false
  wimg1.tintColor = Color.red()
  wimg1.imageSize = new Size(10, 10)
  wimg1.centerAlignImage()

  hStack1.addSpacer(1)

  let label1 = hStack1.addText(filteredData[filteredData.length - 1].AnzahlFaelle.toString())
  label1.font = Font.semiboldSystemFont(10)
  label1.centerAlignText()

  let countryname = list.addText(filteredData[filteredData.length - 1].Bundesland)
  countryname.centerAlignText()
  countryname.font = Font.mediumSystemFont(12)

  list.addSpacer()

  // Data County
  /// Check if BundeslandID is given
  if (!args.widgetParameter) {
    console.log('No BundeslandID found. Using default: ' + defaultArea)
    area = defaultArea
  } else {
    console.log('Found BundeslandID: ' + args.widgetParameter)
    area = args.widgetParameter
  }

  filteredData = globalData.CovidFaelle_Timeline.filter(function (f) {
    return f.BundeslandID === area
  })

  // Display Data County
  const hStack2 = list.addStack()
  hStack2.layoutHorizontally()
  hStack2.centerAlignContent()

  label0 = hStack2.addText(filteredData[filteredData.length - 1].AnzahlFaelleSum.toString())
  label0.font = Font.semiboldSystemFont(22)
  label0.centerAlignText()

  hStack2.addSpacer(2)

  wimg1 = hStack2.addImage(sym1.image)
  wimg1.resizable = false
  wimg1.tintColor = Color.red()
  wimg1.imageSize = new Size(10, 10)
  wimg1.centerAlignImage()

  label1 = hStack2.addText(filteredData[filteredData.length - 1].AnzahlFaelle.toString())
  label1.font = Font.semiboldSystemFont(10)
  label1.centerAlignText()

  countryname = list.addText(filteredData[filteredData.length - 1].Bundesland)
  countryname.centerAlignText()
  countryname.font = Font.mediumSystemFont(12)

  list.addSpacer()

  // Display date of latest update
  const label3 = list.addText('letztes Update:')
  label3.centerAlignText()
  label3.font = Font.mediumSystemFont(7)

  const options = { hour: '2-digit', minute: '2-digit' }

  const label4 = list.addText(convertDate(globalData.CreationDate).toLocaleDateString(Device.locale().replace('_', '-'), options))
  label4.centerAlignText()
  label4.font = Font.mediumSystemFont(8)

  return list
}

// Execution
initializeWidget()
