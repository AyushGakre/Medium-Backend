import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import {signinInput,signupInput} from "@ayushgakre/comman"

export const userRoute = new Hono<{
   Bindings: {
    DATABASE_URL: string,
    mySecret: string
    }
}>()

userRoute.post('/signup', async(c) => {
    const body = await c.req.json();
    const success = signupInput.safeParse(body);
    if(!success){
      return c.json({
        message: "Invalid acc to zod"
      })
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  try{
     const user = await prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
          password: body.password
        }
  })
  //jwt
  const token = await sign({
    id: user.id,
  },c.env.mySecret)
  return c.text(token)
  }
  catch(e){
    return c.json({
      message: "Already exits"
    })
  }
  })
  
  
userRoute.post('/signin', async(c) =>{
    const body = await c.req.json();
    const success = signinInput.safeParse(body);
    if(!success){
      return c.json({
        message: "Invalid acc to zod"
      })
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  try{
     const user = await prisma.user.findFirst({
        where: {
          email: body.email,
          password: body.password
        }
  })
  if(!user){
    c.status(411)
    return c.json({
      message: "Invaild credentials"
    })
  }
  //jwt
  const token = await sign({
    id: user.id,
  },c.env.mySecret)
  return c.text(token)
  }
  catch(e){
    return c.json({
      message: "Already exits"
    })
  }
  })