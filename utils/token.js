
const jwt = require('jsonwebtoken');

const key = "secretoNode";

let generarToken = user => {
    return jwt.sign({
        id: user._id,
        nombre_completo: user.nombre_completo,
        rol: user.rol
    }, key);
};

let validarToken = (token) => {
    try {
        let resultado = jwt.verify(token, key);
        return resultado;
    } catch (e) {

    }
};

function decodificaToken(token) {
    return new Promise((resolve, reject) => {
        try {
            const payload = jwt.decode(token, key, false); // Marcamos false para que verifique firma Fy caducidad
            resolve(payload); // Si todo ha ido bien, devolvemos el id del usuario
        } catch (err) {
            reject({
                status: 401,
                message: err.msg
            });
        }
    });
}

module.exports = {
    generarToken,
    validarToken,
    decodificaToken
}
