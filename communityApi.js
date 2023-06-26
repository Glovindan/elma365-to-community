require('dotenv').config()
const JSZip = require('jszip')

/** Куки */
const COMMUNITY_COOKIE = process.env.COMMUNITY_COOKIE;
/** Токен (url encoded) */
const XF_TOKEN = process.env.XF_TOKEN;

/** Добавление темы */
const addThread = async (title, message, tags, attachmentsHash, section) => {
  /** Окончание строки тела запроса */
  const credentials = `_xfToken=${XF_TOKEN}&_xfRequestUri=%2Fru%2Fforums%2F98%2Fcreate-thread&_xfNoRedirect=1&_xfToken=${XF_TOKEN}&_xfResponseType=json`;
  const body = `title=${title}&message_html=${message}&_xfRelativeResolver=https%3A%2F%2Fcommunity.elma365.com%2Fru%2Fforums%2Fscript-examples%2Fcreate-thread&tags=${tags}&attachment_hash=${attachmentsHash}&watch_thread_state=1&poll%5Bquestion%5D=&poll%5Bresponses%5D%5B%5D=&poll%5Bresponses%5D%5B%5D=&poll%5Bmax_votes_value%5D=1&poll%5Bchange_vote%5D=1&poll%5Bview_results_unvoted%5D=1&${credentials}`

//   section = "98"
  const URL = `https://community.elma365.com/ru/forums/${section}/add-thread`;

  const elementData = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Cookie": COMMUNITY_COOKIE
      },
      body: body
  })

  const responseJson = await elementData.json();

  return responseJson;
}

/** Архивирование файла */
const zipFile = async (fileName, fileContent) => {
  const zip = new JSZip();
  zip.file(fileName, await fileContent.arrayBuffer());
  
  const content = await zip.generateAsync({type:"blob"});

  return content;
}

/** Выгразка файла в коммьюнити */
const uploadFile = async(fileName, fileContent, uploadHash, section) => {
  /** Окончание строки тела запроса */

  const fileNameExtension = fileName.match(/\.(.*$)/)[1].toLowerCase();
  const allowedExtensions = ['zip','e365','pdf','jpeg','jpg','jpe','gif','png']
  console.log(fileName);

  let fileData = fileContent;  
  /** Архивирование файла, если не подходит формат для коммьюнити */
  if(!allowedExtensions.find(ae => ae === fileNameExtension)) {
    fileData = await zipFile(fileName, fileContent);
    fileName = fileName.replace(/\.(.*$)/, ".zip")
  }

  // Тут я хз почему 15 у всех разделов, но 98 у раздела для тестов
  section = "15"
  const formData = new FormData();
  formData.append("upload", fileData, fileName);
  formData.append("_xfToken", decodeURIComponent(XF_TOKEN));
  formData.append("hash", uploadHash);
  formData.append("content_type", 'post');
  formData.append("key", '');
  formData.append("content_data[node_id]", section);
  formData.append("_xfNoRedirect", '1');
  formData.append("_xfResponseType", 'json-text');
  formData.append("_xfUploader", '1');

  const URL = `https://community.elma365.com/ru/attachments/do-upload`;

  const elementData = await fetch(URL, {
      method: "POST",
      headers: {
        "Cookie": COMMUNITY_COOKIE
      },
      body: formData
  })

  const responseJson = await elementData.json();

  return responseJson;
}

module.exports = {addThread, uploadFile}