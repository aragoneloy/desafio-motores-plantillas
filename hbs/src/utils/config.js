import dotenv from 'dotenv'
dotenv.config();

export default  {
    db: {
        client: 'mysql',
        connection: {
            host: '127.0.0.1',
            user: `${process.env.MYSQL_USER}`,
            password: `${process.env.MYSQL_PASS}`,
            database: 'productos'
        }
    },
    atlas: {
        strConn: `${process.env.MONGO_URL_ECOMMERCE}`
    },
    env: process.env.NODE_ENV
}
