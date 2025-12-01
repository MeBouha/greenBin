"use client";

import React from 'react';
import { useParams } from 'next/navigation';
// correct relative path to the shared user form component
import UserForm from '../../../gestion_utilisateurs/user';

export default function EditUserPage() {
  const params = useParams();
  const idParam = params?.id;

  const normalizedId = Array.isArray(idParam) ? idParam[0] : idParam;

  return <UserForm id={normalizedId} />;
}
