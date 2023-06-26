var XLSX = require("xlsx");

const {getElementDataById, getUserDataById, getDownloadFileDataByHash, getFileDataByFileId} = require('./elmaApi')
const {addThread, uploadFile} = require('./communityApi')
const excelToJson = require('convert-excel-to-json');
const { log } = require("console");

/** Переформатирование текста из ELMA в коммьюнити */
const reformatDescription = (text) => {
  /** Замена кавычек на форматирование [CODE][/CODE] */
  let description = text;
  let skipSymbolsCount = 0;
  let quotes;
  do {
    // Получение первых попавшихся кавычек
    quotes = description.substring(skipSymbolsCount).match(/``+/);
    // Поиск такой же кавычки
    let regex = new RegExp(quotes + '\n([\\S\\s]+?)\n' + quotes);
    const matchRes = description.match(regex);
    
    // Если не найдено - заменить на [CODE] и выйти из цикла
    if(!matchRes) {
      if(quotes) {
        description = description.replace(quotes+"\n", "[CODE]")
        description += "[/CODE]";
      }
      break;
    }

    // Если найдено - заменить на [CODE][/CODE]
    description = description.replace(matchRes[0],`[CODE]${matchRes[1]}[/CODE]`).replaceAll("<","&lt;").replaceAll(">","&gt;");
    skipSymbolsCount = matchRes[0].length;
  } while(quotes)
  
  /** TODO: Замена ``text`` и `text` на <span style="font-family: 'Courier New'">text</span> */
  /** Замена пробелов перед символами */
    
  /** Перенос строк в html */
  const regexHtml = /^(.+?)$/gm;
  const matchResHtml = description.matchAll(regexHtml);

  let next = matchResHtml.next();
  
  while(!next.done) {
    description = description.replace(next.value[0],`<p>${next.value[1]}</p>`);
    next = matchResHtml.next();
  }

  description = description.replaceAll("\n","<p><br></p>")
  description = description.replaceAll(/  /gm,"&nbsp; ");

  return description;
}

const getSectionByData = (applicationArea, scriptsWritten) => {
  if((scriptsWritten && scriptsWritten.find(sw => sw === "putty")) || (applicationArea && applicationArea.find(aa => aa === "servera" || aa === "microservice"))) {
    return 'on-premises-solutions'
  }

  if((scriptsWritten && (scriptsWritten.find(sw => sw === "modules") || scriptsWritten.find(sw => sw === "widget_code"))) || ((applicationArea && applicationArea.find(aa => aa === "module" || aa === "portal" || aa === "solution_architecture" || aa === "integraciya")))) {
  return 'solutions-and-modules'
  } 

  return 'script-examples'
}

//TODO: Маршрутизация по категориям
const start = async(jsonTable) => {
  for(const element of jsonTable) {
    if(element.B !== "Community") {
      element.C = 'Не переносится';
      continue;
    }

    const elementId = element.A.match(/.*\/(.*?)\)/)[1];  
    // const elementId = 'b30a86b5-9d28-417f-b2a8-c7671cd0eb09';
    const getRes = await getElementDataById(elementId)
    const data = getRes.result[0];
    console.log("-------ДАННЫЕ ИЗ ЭЛМЫ--------");
    console.log(data);
    log();
    const description = reformatDescription(data.opisanie);
    
    const allTags = data.all_tags;
    const applicationArea = data.application_area ? data.application_area.map(aa => aa.code) : [];
    const scriptWritten = data.script_written ? data.script_written.map(sw => sw.code) : [];

    const section = getSectionByData(applicationArea, scriptWritten);

    const title = element.D ? "!" + data.__name : data.__name;
    const links = data.ssylki;

    const filesIds = data.faily;  
    const uploadHash = 'test';
    
    /** Флаг проверки на успешность загрузки файла */
    const isUploadFailed = false;
    if(filesIds) {
      console.log("-------ВЫГРУЗКА ФАЙЛОВ--------");
      for(const fileId of filesIds) {
        const fileData = await getFileDataByFileId(fileId)

        const downloadData = await getDownloadFileDataByHash(fileData.hash);
        const downloadURL = downloadData.link.replaceAll("\u0026","&");
        const file = await fetch(downloadURL);
        
        const fileContent = await file.blob();
        const fileName = fileData.originalName;

        // Выгрузка файла в community
        const response = await uploadFile(fileName, fileContent, uploadHash, section);
        log("-------РЕЗУЛЬТАТ ВЫГРУЗКИ---------");
        log(response);
        log();

        if(response.error) {
          isUploadFailed = true;
          break;
        }
      }
    }

    if(isUploadFailed) {
      element.E = "Ошибка переноса";
      continue;
    }

    // Добавление ссылок и примечания к описанию
    const formattedDescription = encodeURIComponent(`${description}\n${links ? "<br><p>Ссылки: " + links + "</p>" : ""}<br>${element.D ? "<br><p>Примечание: " + element.D + "</p>" : ""}`);
    
    // Создание темы
    const createRes = await addThread(
      title,
      formattedDescription,
      allTags,
      uploadHash,
      section
    )

    log("-------РЕЗУЛЬТАТ СОЗДАНИЯ ТЕМЫ---------");
    log(createRes);
    log();
    
    element.C = 'Перенос завершён';
    element.E = createRes._redirectStatus === 'ok' ? createRes._redirectTarget : "Ошибка переноса";
    await new Promise((res) => setTimeout(() => {res()}, 30000));// Ожидание между запрсоами
  }
  
  return(jsonTable)
}

/** Список строк из xlsx */
const xlsxFile = "Перенос базы знаний QuickBPM.xlsx";
const xlsxToJson = excelToJson({sourceFile: xlsxFile, header:{rows: 1}});
const jsonData = xlsxToJson['Лист1'].filter(row => row.B === "Community");

const elementsIds = jsonData.map(el => {return {id: el.A.match(/.*\/(.*?)\)/)[1], note: el.C}})

start(xlsxToJson['Лист1'])
.then(result => {
  const worksheet = XLSX.utils.json_to_sheet(result);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Result");
  XLSX.writeFile(workbook, "Result.xlsx", { compression: true });
});

