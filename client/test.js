describe('CORS requests', () => {
  describe('DependsOnMethod', () => {
    it('GET /hello', async () => {
      const response = await fetch('http://localhost:3010/hello');

      console.assert(response.ok);
      console.assert(response.status === 200);

      const data = await response.json();

      console.assert('status' in data && data.status === 'success');
    });

    it('POST /hello', async () => {
      const response = await fetch('http://localhost:3010/hello', {
        method: 'POST',
      });

      console.assert(response.ok);
      console.assert(response.status === 200);

      const data = await response.json();

      console.assert('status' in data && data.status === 'success');
    });

    it('PUT /hello', async () => {
      const response = await fetch('http://localhost:3010/hello', {
        method: 'PUT',
      });

      console.assert(response.ok);
      console.assert(response.status === 200);

      const data = await response.json();

      console.assert('status' in data && data.status === 'success');
    });

    it('PATCH /hello', async () => {
      const response = await fetch('http://localhost:3010/hello', {
        method: 'PATCH',
      });

      console.assert(response.ok);
      console.assert(response.status === 200);

      const data = await response.json();

      console.assert('status' in data && data.status === 'success');
    });

    it('DELETE /hello', async () => {
      const response = await fetch('http://localhost:3010/hello', {
        method: 'DELETE',
      });

      console.assert(response.ok);
      console.assert(response.status === 200);

      const data = await response.json();

      console.assert('status' in data && data.status === 'success');
    });
  });

  describe('Single path per endpoint', () => {
    it('GET /get', async () => {
      const response = await fetch('http://localhost:3010/get');

      console.assert(response.ok);
      console.assert(response.status === 200);

      const data = await response.json();

      console.assert('status' in data && data.status === 'success');
    });

    it('POST /post', async () => {
      const response = await fetch('http://localhost:3010/post', {
        method: 'POST',
      });

      console.assert(response.ok);
      console.assert(response.status === 200);

      const data = await response.json();

      console.assert('status' in data && data.status === 'success');
    });

    it('PUT /put', async () => {
      const response = await fetch('http://localhost:3010/put', {
        method: 'PUT',
      });

      console.assert(response.ok);
      console.assert(response.status === 200);

      const data = await response.json();

      console.assert('status' in data && data.status === 'success');
    });

    it('PATCH /patch', async () => {
      const response = await fetch('http://localhost:3010/patch', {
        method: 'PATCH',
      });

      console.assert(response.ok);
      console.assert(response.status === 200);

      const data = await response.json();

      console.assert('status' in data && data.status === 'success');
    });

    it('DELETE /delete', async () => {
      const response = await fetch('http://localhost:3010/delete', {
        method: 'DELETE',
      });

      console.assert(response.ok);
      console.assert(response.status === 200);

      const data = await response.json();

      console.assert('status' in data && data.status === 'success');
    });
  });

  describe('Endpoint with multiple methods', () => {
    it('GET /all', async () => {
      const response = await fetch('http://localhost:3010/all');

      console.assert(response.ok);
      console.assert(response.status === 200);

      const data = await response.json();

      console.assert('status' in data && data.status === 'success');
    });

    it('POST /all', async () => {
      const response = await fetch('http://localhost:3010/all', {
        method: 'POST',
      });

      console.assert(response.ok);
      console.assert(response.status === 200);

      const data = await response.json();

      console.assert('status' in data && data.status === 'success');
    });

    it('PUT /all', async () => {
      const response = await fetch('http://localhost:3010/all', {
        method: 'PUT',
      });

      console.assert(response.ok);
      console.assert(response.status === 200);

      const data = await response.json();

      console.assert('status' in data && data.status === 'success');
    });

    it('PATCH /all', async () => {
      const response = await fetch('http://localhost:3010/all', {
        method: 'PATCH',
      });

      console.assert(response.ok);
      console.assert(response.status === 200);

      const data = await response.json();

      console.assert('status' in data && data.status === 'success');
    });

    it('DELETE /all', async () => {
      const response = await fetch('http://localhost:3010/all', {
        method: 'DELETE',
      });

      console.assert(response.ok);
      console.assert(response.status === 200);

      const data = await response.json();

      console.assert('status' in data && data.status === 'success');
    });
  });
});
