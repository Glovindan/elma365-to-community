/**
 *
 * Функции с запросами к elma365
 *
 */

/** Токен авторизации */
const ELMA365_TOKEN = process.env.ELMA365_TOKEN;
/** Куки */
const ELMA365_COOKIE = process.env.ELMA365_COOKIE;

/** Получение данных элемента приложения
 * @param {string} elementId Идентификатор элемента quick в elma365
 * @returns {Promise<any>} JSON ответа запроса (Содержит данные элемента quick)
 */
//TODO: Возможно переделать под запрос сразу всех/нескольких элементов
const getElementDataById = async (elementId) => {
  const body = {
    active: true,
    ascending: false,
    from: 0,
    q: JSON.stringify({
      and: [{ in: [{ const: elementId }, { field: "__id" }] }],
    }),
    size: 1,
    sortField: "__createdAt",
  };

  const URL =
    "https://team.s-elma365.ru/api/apps/elma365_ru/poleznaya_informaciya/items/list";

  const authHeader = `Bearer ${ELMA365_TOKEN}`;

  const elementData = await fetch(URL, {
    method: "POST",
    headers: {
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  });

  const responseJson = await elementData.json();

  return responseJson;
};

/** Получение данных пользователя
 * @param {string} userId Идентификатор пользователя в elma365
 * @returns {Promise<any>} JSON ответа запроса (Содержит данные пользователя)
 */
const getUserDataById = async (userId) => {
  const body = { ids: [userId] };

  const URL = "https://team.s-elma365.ru/api/worker/query/system/users/by_ids";

  const elementData = await fetch(URL, {
    method: "PUT",
    headers: {
      Cookie: ELMA365_COOKIE,
    },
    body: JSON.stringify(body),
  });

  const responseJson = await elementData.json();

  return responseJson;
};

/** Получение ссылки на скачивание файла по хэшу
 * @param {string} id хэш-номер файла в elma365
 * @returns {Promise<any>} JSON ответа запроса (Содержит ссылку на скачивание файла и его данные)
 */
const getDownloadFileDataByHash = async (id) => {
  const URL = `https://team.s-elma365.ru/api/disk/files/${id}/getlink`;
  const authHeader = `Bearer ${ELMA365_TOKEN}`;

  const elementData = await fetch(URL, {
    method: "GET",
    headers: {
      Authorization: authHeader,
      Cookie: ELMA365_COOKIE,
    },
  });

  const responseJson = await elementData.json();

  return responseJson;
};

/** Получение данных скачиваемого файла (включая хэш)
 * @param {string} elmaFileId Идентификатор файла в elma365
 * @returns {Promise<any>} JSON ответа запроса (Содержит данные файла)
 */
const getFileDataByFileId = async (elmaFileId) => {
  const URL = `https://team.s-elma365.ru/api/disk/files/${elmaFileId}`;
  const authHeader = `Bearer ${ELMA365_TOKEN}`;

  const elementData = await fetch(URL, {
    method: "GET",
    headers: {
      Authorization: authHeader,
      Cookie: ELMA365_COOKIE,
    },
  });

  const responseJson = await elementData.json();

  return responseJson;
};

module.exports = {
  getElementDataById,
  getUserDataById,
  getDownloadFileDataByHash,
  getFileDataByFileId,
};
