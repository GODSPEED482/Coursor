"use client"
import React from 'react'
import { useParams } from 'next/navigation'

const Page = () => {
    const params = useParams();
    return (
        <div>course {params.slug}</div>
    )
}

export default Page