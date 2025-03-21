const fs = require('fs');
const path = require('path');

let storage = (base64, carpeta) => {
    const File = base64.split(',');
    const extencionBlock = File[0].split('/');
    const extencionSubBlock = extencionBlock[1].split(';');
    const name = Date.now() + '.' + extencionSubBlock[0];;
    
    let dirPath = path.join(__dirname, '../uploads', carpeta);
    let filePath = path.join(dirPath, `${name}`);

    // Verifica si la carpeta existe, si no, créala
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFile(filePath, File[1], 'base64', function (err) {
        if (err) {
            console.log(err);
            throw 'No se ha podido crear el archivo';
        }
    });

    return name;
}

module.exports = { storage };
