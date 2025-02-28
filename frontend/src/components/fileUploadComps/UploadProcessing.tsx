import { Loader } from "lucide-react"
export default function UploadProcessing () {


    return <div className ="text-black  flex flex-col items-center justify-center space-y-4 p-8">
        
        <div className="animate-spin">
                <Loader className="h-12 w-12 text-violet-700" />
              </div>
    <div className="text-lg font-semibold"> Analyzing your Pictures with our advanced, powerful Models. 💪</div>
          
    
    </div>
}