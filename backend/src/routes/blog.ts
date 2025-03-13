import { createPostInput, updatePostInput } from "@bhupendrasingh05/medium-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    };
    Variables: {
        userId: string;
    };
}>();

// Middleware for JWT Authentication
blogRouter.use("/*", async (c, next) => {
    const authHeader = c.req.header("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();  // ✅ Extract the token

    try {
        const user = await verify(token, c.env.JWT_SECRET);
        if (user) {
            c.set("userId", user.id as string);
            await next();
        } else {
            c.status(403);
            return c.json({ message: "You are not logged in" });
        }
    } catch (e) {
        c.status(403);
        return c.json({ message: "Invalid token" });
    }
});

// Create Post
blogRouter.post("/", async (c) => {
    const body = await c.req.json();
    const { success } = createPostInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({ message: "Inputs not correct" });
    }

    const authorId = c.get("userId");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const post = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: authorId,
        },
    });

    return c.json({ id: post.id });
});

// Update Post
blogRouter.put("/", async (c) => {
    const body = await c.req.json();
    const { success } = updatePostInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({ message: "Inputs not correct" });
    }

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const post = await prisma.post.update({
        where: { id: body.id },
        data: {
            title: body.title,
            content: body.content,
        },
    });

    return c.json({ id: post.id });
});

// Get All Blogs (Bulk)
blogRouter.get("/bulk", async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const posts = await prisma.post.findMany({
        select: {
            id: true,
            title: true,
            content: true,
            author: {
                select: {
                    name: true,
                },
            },
        },
    });

    return c.json({ blogs: posts });
});

// Get Blog by ID (✅ Fixed Syntax)
blogRouter.get("/:id", async (c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const post = await prisma.post.findFirst({
            where: { id: id },  // ✅ Fixed Placement of `where`
            select: {       
              id: true,
                title: true,
                content: true,
                author: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!post) {
            c.status(404);
            return c.json({ message: "Post not found" });
        }

        return c.json({ post });
    } catch (e) {
        c.status(500);
        return c.json({ message: "Error while fetching blog post" });
    }
});
