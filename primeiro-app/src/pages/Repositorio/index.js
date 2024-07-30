import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Owner,
  Loading,
  BackButton,
  IssuesList,
  PageActions,
  NavStates
} from "./styles";
import { FaArrowLeft } from "react-icons/fa";
import api from "../../services/api";

export default function Repositorio() {
  const { repositorio } = useParams();

  const [repositorioData, setRepositorioData] = useState({});
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [state, setState] = useState("all")

  useEffect(() => {
    async function load() {
      const nomeRepo = decodeURIComponent(repositorio);

      const [repositorioResponse, issuesResponse] = await Promise.all([
        api.get(`/repos/${nomeRepo}`),
        api.get(`/repos/${nomeRepo}/issues`, {
          params: {
            state: `${state}`,
            per_page: 5,
          },
        }),
      ]);

      setRepositorioData(repositorioResponse.data);
      setIssues(issuesResponse.data);
      setLoading(false);
    }

    load();
  }, [repositorio, state]);

  useEffect(() => {
    async function loadIssue() {
      const nomeRepo = decodeURIComponent(repositorio);

      const response = await api.get(`/repos/${nomeRepo}/issues`, {
        params: {
          state: "open",
          page,
          per_page: 5,
        },
      });

      setIssues(response.data);
      console.log(state)
    }

    loadIssue();
  }, [page]);

  function handlePage(action) {
    setPage(action === "back" ? page - 1 : page + 1);
  }

  if (loading) {
    return (
      <Loading>
        <h1>Carregando...</h1>
      </Loading>
    );
  }

  return (
    <Container>
      <BackButton to="/">
        <FaArrowLeft color="#000" size={30} />
      </BackButton>
      <Owner>
        <img
          src={repositorioData.owner.avatar_url}
          alt={repositorioData.owner.login}
        />
        <h1>{repositorioData.name}</h1>
        <p>{repositorioData.description}</p>
      </Owner>

      <NavStates>
        <button type="button" onClick={() => setState('open')}>Open</button>
        <button type="button" onClick={() => setState('closed')}>Closed</button>
        <button type="button" onClick={() => setState('all')}>All</button>
      </NavStates>

      <IssuesList>
        {issues.map((issue) => (
          <li key={String(issue.id)}>
            <img src={issue.user.avatar_url} alt={issue.user.login} />

            <div>
              <strong>
                <a href={issue.html_url}>{issue.title}</a>

                {issue.labels.map((label) => (
                  <span key={String(label.id)}>{label.name}</span>
                ))}

                <p>{issue.user.login}</p>
              </strong>
            </div>
          </li>
        ))}
      </IssuesList>

      <PageActions>
        <button
          type="button"
          onClick={() => handlePage("back")}
          disabled={page < 2}
        >
          Voltar
        </button>
        <button type="button" onClick={() => handlePage("next")}>
          Próxima
        </button>
      </PageActions>
    </Container>
  );
}
