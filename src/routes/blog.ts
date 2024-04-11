import { Hono } from "hono"

export const blogRoute = new Hono<{
    Bindings: {

    }
}>()

blogRoute.post('/', async(c) =>{
    
    
})
blogRoute.put('/', (c) =>{
    return c.text('hello post blog')
})

blogRoute.get('/:id', (c) => {
    const blogid = c.req.param('id')
    console.log(blogid)
    return c.text('hello blod id')
})

blogRoute.get('/bulk', (c)=>{
    return c.text('get blog')
})