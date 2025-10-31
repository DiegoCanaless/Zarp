// src/reducer/user/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AutorizacionesCliente } from '../../types/enums/AutorizacionesCliente';

type Propiedad = any; // si podés, reemplazá `any` por el tipo real

export interface UserState {
  id: string | null;
  uid: string;
  fullname: string;
  email: string;
  token: string;
  photoURL: string;
  AuthenticatedEmail: boolean;
  AuthenticatedDocs: boolean;
  rol: string;
  propiedades: Propiedad[];
  autorizaciones: typeof AutorizacionesCliente[keyof typeof AutorizacionesCliente];
}

const deriveAutorizacionesFromBooleans = (credMP?: boolean, credPP?: boolean) => {
  if (credMP && credPP) return AutorizacionesCliente.AMBAS;
  if (credMP) return AutorizacionesCliente.MERCADO_PAGO;
  if (credPP) return AutorizacionesCliente.PAYPAL;
  return AutorizacionesCliente.NINGUNA;
};

const rawStored: Partial<UserState & Record<string, any>> =
  JSON.parse(localStorage.getItem('user') || '{}');

const userFromStorage: UserState = {
  id: rawStored.id ?? null,
  uid: rawStored.uid ?? '',
  fullname: rawStored.fullname ?? '',
  email: rawStored.email ?? '',
  token: rawStored.token ?? '',
  photoURL: rawStored.photoURL ?? '',
  AuthenticatedEmail: rawStored.AuthenticatedEmail ?? false,
  AuthenticatedDocs: rawStored.AuthenticatedDocs ?? false,
  rol: rawStored.rol ?? 'CLIENTE',
  propiedades: rawStored.propiedades ?? [],
  autorizaciones:
    rawStored.autorizaciones ??
    deriveAutorizacionesFromBooleans(rawStored.CredencialesMP, rawStored.CredencialesPP) ??
    AutorizacionesCliente.NINGUNA,
};

const isPropiedadVisible = (prop: any) => {
  const status = String(
    prop?.verificacionPropiedad ?? prop?.verificacion ?? prop?.estado ?? ''
  ).toUpperCase();
  return status !== 'RECHAZADA' && status !== 'PENDIENTE';
};

const sanitizeProps = (props: Propiedad[] = []) => props.filter(isPropiedadVisible);

const initialState: UserState = {
  ...userFromStorage,
  propiedades: sanitizeProps(userFromStorage.propiedades),
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState> & Record<string, any>>) => {
      const p = action.payload;
      if (p.id !== undefined) state.id = p.id;
      if (p.uid !== undefined) state.uid = p.uid;
      if (p.fullname !== undefined) state.fullname = p.fullname;
      if (p.email !== undefined) state.email = p.email;
      if (p.token !== undefined) state.token = p.token;
      if (p.photoURL !== undefined) state.photoURL = p.photoURL;
      if (p.propiedades !== undefined) state.propiedades = sanitizeProps(p.propiedades as Propiedad[]);
      state.AuthenticatedEmail = p.AuthenticatedEmail ?? state.AuthenticatedEmail;
      state.AuthenticatedDocs = p.AuthenticatedDocs ?? state.AuthenticatedDocs;
      state.rol = p.rol ?? state.rol ?? 'CLIENTE';
      if (p.autorizaciones !== undefined) {
        state.autorizaciones = p.autorizaciones as UserState['autorizaciones'];
      } else if (p.CredencialesMP !== undefined || p.CredencialesPP !== undefined) {
        state.autorizaciones = deriveAutorizacionesFromBooleans(
          p.CredencialesMP ?? false,
          p.CredencialesPP ?? false
        );
      }
      localStorage.setItem('user', JSON.stringify(state));
    },

    addPropiedad: (state, action: PayloadAction<Propiedad>) => {
      const nueva = action.payload;
      if (isPropiedadVisible(nueva)) {
        state.propiedades.push(nueva);
        localStorage.setItem('user', JSON.stringify(state));
      }
    },
    removePropiedad: (state, action: PayloadAction<string | number>) => {
      state.propiedades = state.propiedades.filter((prop) => prop.id !== action.payload);
      localStorage.setItem('user', JSON.stringify(state));
    },

    logout: (state) => {
      state.id = null;
      state.uid = '';
      state.fullname = '';
      state.email = '';
      state.token = '';
      state.photoURL = '';
      state.AuthenticatedEmail = false;
      state.AuthenticatedDocs = false;
      state.rol = '';
      state.propiedades = [];
      state.autorizaciones = AutorizacionesCliente.NINGUNA;
      localStorage.removeItem('user');
    },
  },
});

export const { setUser, logout, addPropiedad, removePropiedad } = userSlice.actions;

export const selectUser = (state: any): UserState | undefined => state.user;
export const selectUserRol = (state: any): string => state.user?.rol || 'CLIENTE';
export const selectIsAuthenticated = (state: any): boolean => Boolean(state.user?.token);
export const selectUserPropiedades = (state: any): Propiedad[] => state.user?.propiedades || [];

export const selectAutorizaciones = (state: any) =>
  state.user?.autorizaciones ?? AutorizacionesCliente.NINGUNA;
export const hasMercadoPago = (state: any) => {
  const a = selectAutorizaciones(state);
  return a === AutorizacionesCliente.MERCADO_PAGO || a === AutorizacionesCliente.AMBAS;
};
export const hasPayPal = (state: any) => {
  const a = selectAutorizaciones(state);
  return a === AutorizacionesCliente.PAYPAL || a === AutorizacionesCliente.AMBAS;
};

export default userSlice.reducer;
