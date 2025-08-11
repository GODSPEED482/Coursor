import React from 'react'

const page = ({course}) => {
  return (
    <div>
        {course.name}
        {
            course.modules.map((module, index) => (
                <div key={index}>
                    <h2>{module.title}</h2>
                    <p>{module.description}</p>
                </div>
            ))
        }
    </div>
  )
}

export default page