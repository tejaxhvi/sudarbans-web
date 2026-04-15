<!-- src/views/DashboardView.vue -->
<template>
  <div>
    <MembersNavbar
      :member-email="memberEmail"
      @leave-lounge="leaveLounge"
      @logout="logout"
    />
    <iframe
      src="/sudarbans/dashboard.html"
      style="width:100%; height:calc(100vh - 72px); border:none; display:block;"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import MembersNavbar from '../components/MembersNavbar.vue';

const router = useRouter();
const memberEmail = ref('');

onMounted(() => {
  const token = localStorage.getItem('sundarbans_auth_token');
  if (!token) { router.push('/members'); return; }
  memberEmail.value = token;
});

function leaveLounge() {
  router.push('/');
}
function logout() {
  localStorage.removeItem('sundarbans_auth_token');
  router.push('/members');
}
</script>
