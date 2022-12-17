import MicRecorder from "mic-recorder-to-mp3"
import { useEffect, useState, useRef } from "react"
import axios from "axios"

const assembly = axios.create({
  baseURL: "https://api.assemblyai.com/v2",
  headers: {
    authorization: "0dabffb0c5044fd88510466a0e381932",
    "content-type": "application/json",
    "transfer-encoding": "chunked",
  },
})


const App = () => {
  const recorder = useRef(null) 
  const audioPlayer = useRef(null)
  const [blobURL, setBlobUrl] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [isRecording, setIsRecording] = useState(null)

  useEffect(() => {
    recorder.current = new MicRecorder({ bitRate: 128 })
  }, [])

  const startRecording = () => {
    recorder.current.start().then(() => {
      setIsRecording(true)
    })
  }

  const stopRecording = () => {
    recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const file = new File(buffer, "audio.mp3", {
          type: blob.type,
          lastModified: Date.now(),
        })
        const newBlobUrl = URL.createObjectURL(blob)
        setBlobUrl(newBlobUrl)
        setIsRecording(false)
        setAudioFile(file)
      })
      .catch((e) => console.log(e))
  }

  const [uploadURL, setUploadURL] = useState("")

  useEffect(() => {
    if (audioFile) {
      assembly
        .post("/upload", audioFile)
        .then((res) => setUploadURL(res.data.upload_url))
        .catch((err) => console.error(err))
    }
  }, [audioFile])

  console.log(uploadURL)

  return (
    <div>
      <h1>React Speech Recognition App</h1>
      <audio ref={audioPlayer} src={blobURL} controls='controls' />
      <div>
        <button disabled={isRecording} onClick={startRecording}>
          START
        </button>
        <button disabled={!isRecording} onClick={stopRecording}>
          STOP
        </button>
        <button>SUBMIT</button>
      </div>
    </div>
  )
}

export default App