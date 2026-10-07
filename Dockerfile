# Imagen base optimizada y liviana
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Definir variables de entorno para producción
ENV NODE_ENV=production
ENV PORT=3000

# Copiar archivos de definición de dependencias
COPY package*.json ./

# Instalar dependencias necesarias para la compilación y ejecución
RUN npm install

# Copiar el código fuente completo del proyecto
COPY . .

# Compilar la aplicación para producción
RUN npm run build

# Exponer el puerto de la aplicación
EXPOSE 3000

# Comando de inicio del servidor
CMD ["npm", "start"]
