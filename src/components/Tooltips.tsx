import React from 'react'

export function ToolTip({title}:{title:string}){
    return (
        <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {title}
                </span>
    )
}