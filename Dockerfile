# Usar una imagen de Node.js como base
FROM node:14

# Establecer el directorio de trabajo en la imagen
WORKDIR /usr/src

# Copiar el archivo package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto en el que la aplicación se ejecuta
EXPOSE 8000

# Comando para iniciar la aplicación
CMD [ "npm", "start" ]