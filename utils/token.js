
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

module.exports = {
    generarToken,
    validarToken
}
