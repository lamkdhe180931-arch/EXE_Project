type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  return (
    <main className="admin-login">
      <form className="admin-login-form" action="/api/admin/login" method="post">
        <h1>Admin Login</h1>
        {params.error ? <p className="form-error">Email hoặc mật khẩu không đúng.</p> : null}
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Password
          <input name="password" type="password" required />
        </label>
        <button type="submit">Đăng nhập</button>
      </form>
    </main>
  );
}
