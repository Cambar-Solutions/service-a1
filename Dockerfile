FROM node:18

# Crear el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar los archivos de configuración
COPY package.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de la aplicación
COPY . .

# Exponer el puerto del servidor
EXPOSE 4000

# Comando de inicio
CMD ["node", "server.js"]
