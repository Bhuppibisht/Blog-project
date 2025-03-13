import { Link } from "react-router-dom";

interface BlogCardProps {
    authorName: string;
    title: string;
    content: string;
    publishedDate: string;
    id: string;
}

export const BlogCard = ({
    id,
    authorName,
    title,
    content,
    publishedDate
}: BlogCardProps)  => {
    return <Link to = {`/blog/${id}`}>
    <div className=" p-4 border-b border-slate-200 pb-4 w-screen max-w-screen-md cursor-pointer">
        <div className="flex">
           
         <Avatar name={authorName}  /> 

         <div className="font-extralight pl-2 text-sm flex justify-center flex-col">{authorName}

         </div>
         
         <div className="pl-1">
         &middot;
         </div>

         <div className="pl-2 font-thin text-slate-500"> {publishedDate}</div>
        
        </div>
        <div className="text-xl font-bold pt-2">
            {title}
        </div>
        <div className="text-sm text-gray-1000 mt-1">
            {content.slice(0, 100) + "..."}
        </div>
        <div className="text-slate-500 text-md font-thin pt-4">
            {`${Math.ceil(content.length / 100)} minute read`}
        </div>

       

    </div>
    </Link>
}

export function Avatar({ name, size = 6 }: { name: string; size?: number }) {
    const sizeClasses: Record<number, string> = {
        6: "w-6 h-6",
        8: "w-8 h-8",
        10: "w-10 h-10",
        12: "w-12 h-12",
    };

    const sizeClass = sizeClasses[size] || "w-6 h-6"; 

    return (
        <div className={`relative inline-flex items-center justify-center ${sizeClass} 
            overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600`}>
            <span className="text-xs text-gray-600 dark:text-gray-300">{name[0]}</span>
        </div>
    );
}


    



