'use client'
import { main } from "@/utils/initGoogleGenAI";
import { useEffect, useId, useState } from "react";

export default function ChatSection() {
    const [question, setQuestion] = useState()
    const [answer, setAnswer] = useState()
    const [historyChat, setHistoryChat] = useState({
        text: [
            { id: 0, type: "", text: "" }
        ]
    })

    const SubmitQuestion = async () => {
        setHistoryChat(prev => ({
            ...prev,
            text: [
                ...prev.text,
                {
                    id: Date.now(),
                    type: "question",
                    text: question
                }
            ]
        }))

        try {
            const response = await main(question)

            setHistoryChat(prev => ({
                ...prev,
                text: [
                    ...prev.text,
                    {
                        id: Date.now(),
                        type: "answer",
                        text: response
                    }
                ]
            }))

            console.log(response)
        } catch (error) {
            console.log(error)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            SubmitQuestion()
        }
    }

    return (
        <div className="w-full">
            {historyChat && (
                <div className="w-full">
                    {historyChat?.text?.map(({ text, id, type }) => (
                        <div className={`${type === "question" ? "justify-end" : "justify-start"} ${id === 0 ? "hidden" : ""} w-full flex my-4`} key={id}>
                            <div className="bg-gray-900 max-w-100 rounded-xl p-4">
                                {text}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <input
                type="text"
                placeholder="Masukan pertanyaan anda"
                className="border-2 rounded-2xl w-full py-2 px-4 mt-4"
                onChange={(e) => { setQuestion(e.target.value) }}
                onKeyDown={handleKeyDown}
            />
        </div>
    )
}