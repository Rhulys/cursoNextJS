import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import styles from "./styles.module.css"
import { GetServerSideProps } from "next";

import { db } from "@/src/services/firebaseConnection";
import { doc, addDoc, collection, query, where, getDoc, getDocs, deleteDoc } from "firebase/firestore";
import { Textarea } from "@/src/components/textarea";
import { FaTrash } from "react-icons/fa";

interface TaksProps {
    item: {
        tarefa: string;
        created: string;
        public: boolean;
        user: string;
        taskId: string;
    };
    allComments: CommentProps[]
}

interface CommentProps{
    id: string;
    comment: string;
    taskId: string;
    user: string;
    name: string;
}

export default function Task({item, allComments}: TaksProps){
    const { data: session } = useSession()

    const [input, setInput] = useState("")
    const [comments, setComments] = useState<CommentProps[]>(allComments || [])

    async function handleComment(e: FormEvent){
        e.preventDefault();

        if(input === "") return;

        if(!session?.user?.email || !session?.user?.name) return;

        try {
            const docRef = await addDoc(collection(db, "comments"), {
                comment: input,
                created: new Date(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId
            })

            const data = {
                id: docRef.id,
                comment: input,
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId
            }

            setComments((oldItems) => [...oldItems, data])

            setInput("")
        } catch (error) {
            console.log(error)
        }
    }

    async function handleDeleteComment(id:string){
        try {
            const docRef = doc(db, "comments", id)
            await deleteDoc(docRef)

            const deleteComment = comments.filter((item) => item.id !== id)
            setComments(deleteComment)
        } catch (error) {
            console.log(error)
        }
    }

    return(
        <div className={styles.container}>
            <Head>
                <title>Detalhes da tarefa</title>
            </Head>

            <main className={styles.main}>
                <h1>Tarefa</h1>
                <article className={styles.task}>
                    <p>{item.tarefa}</p>
                </article>
            </main>

            <section className={styles.commentsContainer}>
                <h2>Deixar comentario</h2>
                <form onSubmit={handleComment}>
                    <Textarea
                        value={input}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>)=> setInput(e.target.value)}
                        placeholder="Digite seu comentario..."
                    />
                    <button 
                        className={styles.button} disabled={!session?.user}>
                        Enviar comentario
                    </button>
                </form>
            </section>

            <section className={styles.commentsContainer}>
                <h2>Todos comentarios</h2>
                {comments.length === 0 && (
                    <span>Nenhum comentario foi encontrado...</span>
                )}

                {comments.map((item) => (
                    <article className={styles.comment} key={item.id}>
                        <div className={styles.headComment}>
                            <label className={styles.commentsLabel}>{item.name}</label>
                            {item.user === session?.user?.email && (
                                <button className={styles.buttonTrash} onClick={() => handleDeleteComment(item.id)}>
                                    <FaTrash size={18} color="#EA3140"/>
                                </button>
                            )}
                        </div>
                        <p>{item.comment}</p>
                    </article>
                ))}
            </section>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async({params}) => {
    const id = params?.id as string;
    const docRef = doc(db, "tarefas", id)

    const q = query(collection(db, "comments"), where("taskId", "==", id))
    const snapshotComments = await getDocs(q)

    let allComments: CommentProps[] = [];
    snapshotComments.forEach((doc) => {
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            user: doc.data().user,
            name: doc.data().name,
            taskId: doc.data().taskId
        })
    })
    
    const snapshot = await getDoc(docRef)

    if(snapshot.data() === undefined){
        return {
            redirect:{
                destination: '/',
                permanent: false
            },
        };     
    }

    if(!snapshot.data()?.public){
        return {
            redirect:{
                destination: '/',
                permanent: false
            },
        }; 
    }    

    const miliseconds = snapshot.data()?.created?.seconds * 1000;

    const task = {
        tarefa: snapshot.data()?.tarefa,
        public: snapshot.data()?.public,
        created: new Date(miliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id,
    }

    return{
        props: {
            item: task,
            allComments: allComments,
        }
    }
}