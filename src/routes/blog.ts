import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import {createPostinput,updatepostInput} from "@ayushgakre/comman"

export const blogRoute = new Hono<{
   Bindings: {
    DATABASE_URL: string,
    mySecret: string
    },
    Variables: {
        userId: string
    }
}>()

blogRoute.use('/*', async(c,next)=>{
    const autheader = c.req.header("authorization");
    const user = await verify(autheader || "",c.env.mySecret)
    if(user){
        c.set("userId",user.id)
        await next()
    }
    else{
        c.status(400)
        return c.json({
            message: "You are not logged In"
        })
    }
})
// post blog
blogRoute.post('/', async(c) => {
    const body = await c.req.json();
    const success = createPostinput.safeParse(body);
    if(!success){
      return c.json({
        message: "Invalid acc to zod"
      })
    }
    const authorId = c.get("userId")
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
     const blog = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: parseInt(authorId)
        }
  })
  if(!blog){
    c.status(401)
    return c.json({
        message:"not logged in"
    })
  }
  return c.json({
    id: blog.id
  })
  })
  
// update the blog by passing id
blogRoute.put('/', async(c) =>{
    const body = await c.req.json();
    const success = updatepostInput.safeParse(body);
    if(!success){
      return c.json({
        message: "Invalid acc to zod"
      })
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  try{
     const blog = await prisma.post.update({
        where: {
          id: body.id
        },
        data:{
            title: body.title,
            content: body.content
        }
})
  return c.json(blog)
}
catch(e){
    c.status(401)
    return c.json({
        message: "error occurs"
    })
}
})

blogRoute.get('/Bulk', async(c) =>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const posts = await prisma.post.findMany()
    return c.json(posts);
})
// get blog by id
blogRoute.get('/:id', async (c) =>{
    const id = c.req.param('id')
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    try{
    const getpost = await prisma.post.findFirst({
        where:{
            id: Number(id)
        } 
    })
    return c.json(getpost)
}
catch(e){
    c.status(401)
    return c.json({
        message: "error at get request in /:id"
    })
}
})

