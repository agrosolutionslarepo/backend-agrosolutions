# backend-agro
 backend de application agro
 
 # Ejecucion
 -Para ejecutar el proyecto y ver los cambios en vivo ejecutar el script creado en package.json "npm run dev"
 -Si deseamos ejecutar el proyecto sin ver cambios en vivo debemos ejecutar el script "npm run start"
 
 
-# Error hanndler
--Cualquier cotroller debe implementar el error hanndler, ya esta armado de tal manera que cuando se cree una nueva función utilizar la exprteción try catch de la siguiente manera
+# Error handler
+-Cualquier controller debe implementar el error handler, ya está armado de tal manera que cuando se cree una nueva función utilizar la expresión try catch de la siguiente manera
 module.exports = (request: CustRequest, _res: Response, next: NextFunction) => {
   try {
     const auth = request.get("authorization");
     let token = null;
 
     if (auth && auth.toLowerCase().startsWith("bearer")) {
       token = auth.substring(7);
     }
 
     if (token) {
       const decodedToken = jwt.verify(token, process.env.SECRET);
       if (!decodedToken.id) {
         throw new Error("Token no presentado o no válido");
       }
 
       const { id: userId } = decodedToken;
       console.log(userId);
 
       request.user = userId;
       next();
     } else {
       throw new Error("Token no presentado o no válido");
     }
   } catch (error) {
     next(error); // Pasa el error al middleware de manejo de errores
   }
-};
;

## Variables de entorno para envío de correos

Para que el servicio de recuperación de contraseña pueda enviar emails es necesario definir las siguientes variables en el archivo `.env`:

```
SMTP_HOST=<servidor smtp>
SMTP_PORT=<puerto>
SMTP_USER=<usuario>
SMTP_PASS=<contraseña>
```
