# Imagen base Node.js 20 sobre Alpine Linux
FROM node:20-alpine

# Instalar Python 3, pip y bibliotecas matemáticas/actuariales para la ejecución de scripts .py
RUN apk add --no-cache \
    python3 \
    py3-pip \
    py3-pandas \
    py3-numpy \
    && ln -sf python3 /usr/bin/python

# Establecer directorio de trabajo de la aplicación
WORKDIR /app

# Definir variables de entorno de producción
ENV NODE_ENV=production
ENV PORT=3000
ENV PYTHONUNBUFFERED=1

# Copiar archivos de dependencias de Node.js
COPY package*.json ./

# Instalar dependencias del proyecto
RUN npm install

# Copiar todo el código fuente (incluyendo archivos .py, server.ts y assets)
COPY . .

# Compilar la aplicación para producción
RUN npm run build

# Exponer el puerto de la aplicación web
EXPOSE 3000

# Comando de inicio del servidor
CMD ["npm", "start"]
