/** Токен авторизации */
const ELMA365_TOKEN = process.env.ELMA365_TOKEN;
/** Куки */
const ELMA365_COOKIE = process.env.ELMA365_COOKIE;

/** Получение данных элемента приложения */
//TODO: Возможно переделать под запрос сразу всех/нескольких элементов
const getElementDataById = async (elementId) => {
    const body = {
        "active": true,
        "ascending": false,
        "from": 0,
        "q": `{\"and\":[{\"in\":[{\"const\":\"${elementId}\"},{\"field\":\"__id\"}]}]}`,
        "size": 1,
        "sortField": "__createdAt"
    }

    const URL = "https://team.s-elma365.ru/api/apps/elma365_ru/poleznaya_informaciya/items/list";

    /** Всковырять через консоль */
    const authHeader = `Bearer ${ELMA365_TOKEN}`;

    const elementData = await fetch(URL, {
        method: "POST",
        headers: {
            "Authorization": authHeader
        },
        body: JSON.stringify(body)
    })

    const responseJson = await elementData.json();

    return responseJson;
}

/** Получение данных пользователя */
const getUserDataById = async(userId) => {
    const body = {"ids":[userId]}

    const URL = "https://team.s-elma365.ru/api/worker/query/system/users/by_ids";

    /** Тут какой-то токен тоже из консоли */
    // const cookieHeader = `vtoken=eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNDNkMGE4Yy03NzFkLTRmZjItOTUzYy1jYTMyYmExOTI5NjkiLCJuYW1lIjoi0J3QsNC30LDRgNC-0LIg0JDQvdGC0L7QvSIsInVzZXJUeXBlIjoiZXh0ZXJuYWwiLCJhbGxvd2VkQ29tcGFuaWVzIjpbInRlYW0iXSwicm9sZSI6ImNsaWVudCIsImNyZWF0ZWRBdCI6MTY4NzQ5NzMxNiwiZXhwIjoxNjg5OTE2NTc2LCJpYXQiOjE2ODc0OTczMTYsImlzcyI6InZhaHRlciIsIm5iZiI6MTY4NzQ5NzMxNn0.DnLKR9QN1JDWbBUd-Wfe2AvZIyyyWbMFPktURRQ0gX3fI8HjwqPGV3iT2Bqypz0uMNutDXaoMc78RpZtL-dUaSKPexIR14EpHO31iEHVdgyfxvp2ND3mMRzQRRfzMu_VO1x9ycNjj2jHoXSA5XFo8A2ILVWc8L-7jW_MgSc9JKk`;

    const elementData = await fetch(URL, {
        method: "PUT",
        headers: {
            "Cookie": ELMA365_COOKIE
        },
        body: JSON.stringify(body)
    })

    const responseJson = await elementData.json();

    return responseJson;
}

/** Получение ссылки на скачивание файла по хэшу */
const getDownloadFileDataByHash = async (id) => {
    const URL = `https://team.s-elma365.ru/api/disk/files/${id}/getlink?filename=letter.html`;
    const authHeader = `Bearer ${ELMA365_TOKEN}`;
    /** Тут какой-то токен тоже из консоли */
    // const cookieHeader = `vtoken=eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNDNkMGE4Yy03NzFkLTRmZjItOTUzYy1jYTMyYmExOTI5NjkiLCJuYW1lIjoi0J3QsNC30LDRgNC-0LIg0JDQvdGC0L7QvSIsInVzZXJUeXBlIjoiZXh0ZXJuYWwiLCJhbGxvd2VkQ29tcGFuaWVzIjpbInRlYW0iXSwicm9sZSI6ImNsaWVudCIsImNyZWF0ZWRBdCI6MTY4NzQ5NzMxNiwiZXhwIjoxNjg5OTE2NTc2LCJpYXQiOjE2ODc0OTczMTYsImlzcyI6InZhaHRlciIsIm5iZiI6MTY4NzQ5NzMxNn0.DnLKR9QN1JDWbBUd-Wfe2AvZIyyyWbMFPktURRQ0gX3fI8HjwqPGV3iT2Bqypz0uMNutDXaoMc78RpZtL-dUaSKPexIR14EpHO31iEHVdgyfxvp2ND3mMRzQRRfzMu_VO1x9ycNjj2jHoXSA5XFo8A2ILVWc8L-7jW_MgSc9JKk`;

    const elementData = await fetch(URL, {
        method: "GET",
        headers: {
            "Authorization": authHeader,
            "Cookie": ELMA365_COOKIE
        }
    })

    const responseJson = await elementData.json();

    return responseJson;
}

/** Получение данных скачиваемого файла (включая хэш) */
const getFileDataByFileId = async (elmaFileId) => {
    const URL = `https://team.s-elma365.ru/api/disk/files/${elmaFileId}`;
    const authHeader = `Bearer ${ELMA365_TOKEN}`;
    /** Тут какой-то токен тоже из консоли */
    // const cookieHeader = `vtoken=eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNDNkMGE4Yy03NzFkLTRmZjItOTUzYy1jYTMyYmExOTI5NjkiLCJuYW1lIjoi0J3QsNC30LDRgNC-0LIg0JDQvdGC0L7QvSIsInVzZXJUeXBlIjoiZXh0ZXJuYWwiLCJhbGxvd2VkQ29tcGFuaWVzIjpbInRlYW0iXSwicm9sZSI6ImNsaWVudCIsImNyZWF0ZWRBdCI6MTY4NzQ5NzMxNiwiZXhwIjoxNjg5OTE2NTc2LCJpYXQiOjE2ODc0OTczMTYsImlzcyI6InZhaHRlciIsIm5iZiI6MTY4NzQ5NzMxNn0.DnLKR9QN1JDWbBUd-Wfe2AvZIyyyWbMFPktURRQ0gX3fI8HjwqPGV3iT2Bqypz0uMNutDXaoMc78RpZtL-dUaSKPexIR14EpHO31iEHVdgyfxvp2ND3mMRzQRRfzMu_VO1x9ycNjj2jHoXSA5XFo8A2ILVWc8L-7jW_MgSc9JKk`;

    const elementData = await fetch(URL, {
        method: "GET",
        headers: {
            "Authorization": authHeader,
            "Cookie": ELMA365_COOKIE
        }
    })

    const responseJson = await elementData.json();

    return responseJson;
}

module.exports = {getElementDataById, getUserDataById, getDownloadFileDataByHash, getFileDataByFileId}