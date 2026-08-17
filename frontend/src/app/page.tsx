"use client";

import {Button} from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState} from "react";

const clothes = [
    { name: "Белая футболка", category: "Верх"},
    { name: "Синие джинсы", category: "Низ"},
    { name: "Черные кроссовки", category: "Обувь"},
];




export default function Home() {
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function getFetch() {


        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("http://localhost:8000/health");
            if (!response.ok) {
                throw new Error("Ошибка API");
            }

            const data = await response.json();
            setStatus(data.status);
        }
        catch (error) {
            setError("Не удалось связаться с API");
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-zinc-50 p-8">
            <div className="mx-auto max-w-5xl">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Looksy</h1>
                        <p className="text-zinc-500">Мой гардероб</p>
                    </div>

                    <Button>Добавить вещь</Button>
                </header>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {clothes.map((item) => (
                        <Card key={item.name}>
                            <CardHeader>
                                <CardTitle>{item.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Категория: {item.category}</p>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <Button onClick={getFetch} disabled={isLoading}>
    {isLoading
        ? "Проверяем..."
        : status
            ? "API подключён"
            : "Взять инфу с API"}
</Button>
            </div>
        </main>
    );
}