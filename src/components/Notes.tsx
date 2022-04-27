import { FC, useState, useEffect } from "react";
import "../App.css";
import { listNotes } from "../graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "../graphql/mutations";
import { API } from "aws-amplify";
import { GraphQLResult } from "@aws-amplify/api-graphql";

interface INote {
  id: string;
  name: string;
  description: string;
}

const initialFormState = {
  name: "",
  description: "",
};

const Notes: FC = () => {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const apiData: any = await API.graphql({ query: listNotes });
    setNotes(apiData.data.listNotes.items);
  };

  const createNote = async () => {
    if (!formData.name || !formData.description) return;
    await API.graphql({
      query: createNoteMutation,
      variables: { input: formData },
    });
  };

  const deleteNote = async (id: string) => {
    const newNotesArray = notes.filter((note: INote) => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  };

  return (
    <div>
      <h1>My Notes API</h1>
      <input
        type="text"
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Note name"
        value={formData.name}
      />
    </div>
  );
};

export default Notes;
