import React, { CSSProperties, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { listTodos } from '../graphql/queries';
import { Todo } from '../API';
import styled from 'styled-components';
import { ClockLoader } from 'react-spinners';

interface TodoItemProps {
  isCompleted: boolean;
}

const TodoItem = styled.li<TodoItemProps>`
  text-decoration: ${({ isCompleted }) => (isCompleted ? 'line-through' : 'none')};
  cursor: pointer;

  &:hover {
    background-color: lightgray;
  }
`;

const TodosContainer = styled.div`
  /* Additional container styles can be added here */
`;

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

const ListTodos = ({ setSelectedTodo }: { setSelectedTodo: (t: Todo) => void }) => {
  const { loading, error, data  } = useQuery(gql(listTodos));

  let [color, setColor] = useState("#ffffff");

  if(loading){
    return (
      <ClockLoader
        color={color}
        loading={loading}
        cssOverride={override}
        size={150}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    )
  }

  if (error) return <p>Error: {error.message}</p>;

  const todos = data.listTodos.items;

  return (
    <TodosContainer>
      <h2>Todos</h2>
      <ul>
        {todos.map((todo: any) => (
          <TodoItem key={todo.id} isCompleted={todo.completed} onClick={() => setSelectedTodo(todo)}>
            {todo.name}
          </TodoItem>
        ))}
      </ul>
    </TodosContainer>
  );
};

export default ListTodos;
