import { Container } from "@/components/container";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TicketItem } from "./components/ticket";
import prismaCliente from "@/lib/prisma";
import { ButtonRefresh } from "./components/button";

export default async function dashboard() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/");
    }

    const tickets = await prismaCliente.ticket.findMany({
        where: {
            status: "ABERTO",
            customer: {
                userId: session.user.id,
            },
        },
        include: {
            customer: true,
        },
    });

    return (
        <Container>
            <main className="mt-9 mb-2">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Chamados</h1>

                    <div className="flex items-center gap-3">
                        <ButtonRefresh />

                        <Link
                            href="/dashboard/new"
                            className="bg-blue-500 px-4 py-1 roudend text-white"
                        >
                            Abrir Chamado
                        </Link>
                    </div>
                </div>

                <table className="min-w-full my-2">
                    <thead>
                        <tr>
                            <th className="font-medium text-left pl-1">
                                CLIENTE
                            </th>
                            <th className="font-medium text-left hidden sm:block">
                                DATA CADASTRO
                            </th>
                            <th className="font-medium text-left">STATUS</th>
                            <th className="font-medium text-left">#</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket) => (
                            <TicketItem
                                key={ticket.id}
                                customer={ticket.customer}
                                ticket={ticket}
                            />
                        ))}
                    </tbody>
                </table>
                {tickets.length === 0 && (
                    <h1 className="px-2 md:px-0 text-gray-600">
                        Nenhum ticket aberto foi encontrado...
                    </h1>
                )}
            </main>
        </Container>
    );
}
