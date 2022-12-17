import MicRecorder from "mic-recorder-to-mp3"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import './index.css';

  const assembly = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
      authorization: "0dabffb0c5044fd88510466a0e381932",
      "content-type": "application/json",
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
  const [transcriptID, setTranscriptID] = useState("")
  const [transcriptData, setTranscriptData] = useState("")
  const [transcript, setTranscript] = useState("")

  useEffect(() => {
    if (audioFile) {
      assembly
        .post("/upload", audioFile)
        .then((res) => setUploadURL(res.data.upload_url))
        .catch((err) => console.error(err))
    }
  }, [audioFile])
  const submitTranscriptionHandler = () => {
    assembly
      .post("/transcript", {
        audio_url: uploadURL,
        auto_highlights: true,
        iab_categories: true,
        sentiment_analysis: true
      })
      .then((res) => {
        setTranscriptID(res.data.id)
      })
      .catch((err) => console.error(err))
  }

  const checkStatusHandler = async () => {
    try {
      await assembly.get(`/transcript/${transcriptID}`).then((res) => {
        setTranscriptData(res.data)
		setTranscript(transcriptData.text)
      })
    } catch (err) {
      console.error(err)
    }
  }

  console.log(transcriptData)


  return (
    <div className="Contanier">
      <h1 className="Text">Speech to Text with Sentiment Analysis</h1>
      <audio ref={audioPlayer} src={blobURL} controls='controls' />
      <div className="btn-group">
        <button className="btn" disabled={isRecording} onClick={startRecording}>START</button>
        <button className="btn" disabled={!isRecording} onClick={stopRecording}>STOP</button>
        <button className="btn" onClick={submitTranscriptionHandler}>SUBMIT</button>
        <button className="btn" onClick={checkStatusHandler}>CHECK STATUS</button>
      </div>
      <h2 className="Text2">{transcriptData.text}</h2>    
    </div>  
  )
}

export default App