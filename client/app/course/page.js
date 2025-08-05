import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import React from 'react'

const page = () => {
  return (
    <div className='flex flex-col p-4 h-screen 
    bg-zinc-800 text-white'>

      <div className="flex flex-row gap-4 m-8">
      <Card className="shadow-lg p-4 rounded-lg h-fill w-80">
        <CardTitle>
          <h1 className='text-lg font-semibold text-white ml-4'>
          Course Name
          </h1>
          </CardTitle>
        <CardContent>
          <p className='text-sm text-white/80'>
            description
          </p>
          </CardContent>
        <Button>
          View Course
        </Button>
      </Card>

      </div>
    </div>
  )
}

export default page