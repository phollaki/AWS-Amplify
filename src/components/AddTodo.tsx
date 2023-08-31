import React, { useEffect, useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { listTodos } from '../graphql/queries';
import { createTodo } from '../graphql/mutations';
import styled from 'styled-components';
import { API, graphqlOperation } from 'aws-amplify';
import { GraphQLSubscription } from '@aws-amplify/api';
import * as subscriptions from '../graphql/subscriptions';
import { OnCreateTodoSubscription } from '../API';
import { toast } from 'react-hot-toast';

const TodoForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const TextInput = styled.input`
  margin-bottom: 10px;
  padding: 5px;
`;

const AddButton = styled.button`
  padding: 8px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const AddTodo = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [addTodo] = useMutation(gql(createTodo), {
    variables: {
      input: {
        name,
        description,
        completed: false,
      },
    },
    onCompleted: () => console.log('Todo is created.'),
    refetchQueries: [{ query: gql(listTodos) }],
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log('Adding todo...');
    await addTodo();
  };

  useEffect(() => {
    const sub = API.graphql<GraphQLSubscription<OnCreateTodoSubscription>>(
      graphqlOperation(subscriptions.onCreateTodo)
    ).subscribe({
      next: ({ value }) => toast.success(`Todo is successfully created! Name: ${value.data?.onCreateTodo?.name}, description: ${value.data?.onCreateTodo?.description}`),
      error: (error) => console.warn(error)
    });

    return () => sub.unsubscribe();
  }, []);

  return (
    <div>
      <h2>Add Todo</h2>
      <TodoForm onSubmit={handleSubmit}>
        <TextInput
          type="text"
          placeholder="Todo name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextInput
          type="text"
          placeholder="Todo description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <AddButton type="submit">Add Todo</AddButton>
      </TodoForm>
    </div>
  );
};

export default AddTodo;
