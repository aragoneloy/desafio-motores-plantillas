import {faker} from '@faker-js/faker'

export default function generarObjetoRandom(){
    return{
        
        title: faker.commerce.product(),
        price: faker.commerce.price(100, 5000, 2, '$'),
        thumbnail: faker.image.food(640, 480, true)
    }
}