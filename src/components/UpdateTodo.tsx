import React, { useState, useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';
import { listTodos } from '../graphql/queries';
import { updateTodo as update, deleteTodo as remove } from '../graphql/mutations';
import { OnDeleteTodoSubscription, OnUpdateTodoSubscription, Todo } from '../API';
import styled from 'styled-components';

import { API, graphqlOperation } from 'aws-amplify';
import { GraphQLSubscription } from '@aws-amplify/api';
import * as subscriptions from '../graphql/subscriptions';
import { OnCreateTodoSubscription } from '../API';
import { toast } from 'react-hot-toast';

interface UpdateTodoProps {
  todo: Todo;
}

const TodoForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const TextInput = styled.input`
  margin-bottom: 10px;
  padding: 5px;
`;

const CheckboxInput = styled.input`
  margin-bottom: 10px;
`;

const UpdateButton = styled.button`
  margin-top: 10px;
  padding: 8px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #218838;
  }
`;

const RemoveButton = styled.button`
  margin-top: 10px;
  padding: 8px 15px;
  background-color: #dc3545;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
  }
`;

const UpdateTodo: React.FC<UpdateTodoProps> = ({ todo }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setName(todo.name);
    setDescription(todo.description || '');
    setIsCompleted(todo.completed || false);
  }, [todo]);

  const [updateTodo] = useMutation(gql(update), {
    variables: {
      id: todo.id,
      input: {
        id: todo.id,
        name,
        description,
        completed: isCompleted,
      },
    },
    onCompleted: () => console.log('Todo is updated.'),
    refetchQueries: [{ query: gql(listTodos) }],
  });

  const [deleteTodo] = useMutation(gql(remove), {
    variables: { input: { id: todo.id } },
    onCompleted: () => console.log('Todo is removed.'),
    refetchQueries: [{ query: gql(listTodos) }],
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTodo();
  };

  const handleDelete = async () => {
    await deleteTodo();
  };

  useEffect(() => {
    const deleteSub = API.graphql<GraphQLSubscription<OnDeleteTodoSubscription>>(
      graphqlOperation(subscriptions.onDeleteTodo)
    ).subscribe({
      next: ({ value }) => toast.success(`Todo is successfully removed! ID: ${value.data?.onDeleteTodo?.id}, name: ${value.data?.onDeleteTodo?.name}`),
      error: (error) => console.warn(error)
    });

    const updateSub = API.graphql<GraphQLSubscription<OnUpdateTodoSubscription>>(
      graphqlOperation(subscriptions.onUpdateTodo)
    ).subscribe({
      next: ({ value }) => toast.success(`Todo is successfully updated! ID: ${value.data?.onUpdateTodo?.id}`),
      error: (error) => console.warn(error)
    });

    return () => {
      deleteSub.unsubscribe();
      updateSub.unsubscribe();
    };
  }, []);

  return (
    <div>
      <h2>Update Todo</h2>
      <TodoForm onSubmit={handleUpdate}>
        <TextInput
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextInput
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label>
          <CheckboxInput
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
          />
          {isCompleted ? 'Completed' : 'Not Completed'}
        </label>
        <UpdateButton type="submit">Update Todo</UpdateButton>
        <RemoveButton type="button" onClick={handleDelete}>Remove Todo</RemoveButton>
      </TodoForm>
    </div>
  );
};

export default UpdateTodo;